import logging
import functools
import re
from typing import List, Dict, Any, Optional
from .ingest import collection, embedder, in_memory_store
from rag.corpus_metadata import AuthorityLevel, CurrentnessStatus
from rag.currentness import verify_currentness

logger = logging.getLogger(__name__)


@functools.lru_cache(maxsize=512)
def _get_cached_query_embedding(query_text: str):
    """Caches SentenceTransformer query embeddings for performance."""
    if embedder:
        return embedder.encode([query_text]).tolist()
    return None


GENERIC_LEGAL_STOPWORDS = {
    "section", "sections", "sec", "secs", "act", "acts", "article", "articles", "art",
    "legal", "provision", "provisions", "under", "code", "codes", "shall", "court", "courts",
    "state", "states", "india", "rule", "rules", "order", "orders", "number", "numbers",
    "title", "chapter", "part", "statutory", "statute", "statutes", "matter", "matters",
    "law", "laws", "case", "cases", "judgment", "judgments", "some", "any", "other", "such",
    "completely", "non", "item", "page", "para", "paragraph"
}

def _normalize_word(w: str) -> str:
    w = w.lower()
    if w in ("license", "licence"): return "licence"
    if w in ("offense", "offence"): return "offence"
    if w in ("judgment", "judgement"): return "judgement"
    if w in ("penalty", "penalties"): return "penalty"
    return w


def _calculate_hybrid_score(
    query_text: str,
    doc_text: str,
    meta: Dict[str, Any],
    vector_distance: float
) -> float:
    """
    Phase 7 Hybrid Score Calculation.
    Combines:
    1. Semantic similarity score (1.0 - dist/2)
    2. Specific non-generic keyword overlap score
    3. Authority level bonus
    4. Exact section / citation / act match bonus
    5. Statutory currentness bonus
    """
    # 1. Semantic Score (0.0 to 1.0)
    sem_score = max(0.0, min(1.0, 1.0 - (vector_distance / 2.0)))

    # 2. Specific Non-Generic Lexical Score
    q_words = {_normalize_word(w) for w in re.findall(r"\w+", query_text.lower())}
    specific_keywords = {w for w in q_words if len(w) > 2 and w not in GENERIC_LEGAL_STOPWORDS}
    doc_words = {_normalize_word(w) for w in re.findall(r"\w+", doc_text.lower())}
    meta_words = {_normalize_word(w) for w in re.findall(r"\w+", f"{meta.get('act', '')} {meta.get('section', '')} {meta.get('title', '')} {meta.get('case_name', '')} {meta.get('citation', '')}".lower())}
    all_target_words = doc_words.union(meta_words)

    if specific_keywords:
        matched_specific = specific_keywords.intersection(all_target_words)
        lexical_score = len(matched_specific) / len(specific_keywords)
    else:
        matched_specific = set()
        lexical_score = 0.5 if q_words else 0.0

    # 3. Authority & Primary Statute Hierarchy Bonus
    auth_lvl = int(meta.get("authority_level") or 2)
    doc_type = str(meta.get("document_type") or "").upper()
    corpus = str(meta.get("corpus") or "").upper()
    is_primary_statute = (auth_lvl == 1 or doc_type == "STATUTE" or corpus == "GLOBAL_STATUTES")

    auth_bonus = 1.0 if is_primary_statute else max(0.1, 0.6 - (auth_lvl * 0.15))

    # 4. Exact Section / Citation / Act Match Bonus (Word-Boundary Enforced)
    exact_bonus = 0.0
    sec = str(meta.get("section") or "").strip().lower()
    cit = str(meta.get("citation") or "").strip().lower()
    act = str(meta.get("act") or "").strip().lower()
    q_lower = query_text.lower()

    if sec:
        sec_core = sec.split(":")[0].strip()
        if re.search(r'\b' + re.escape(sec_core) + r'\b', q_lower):
            exact_bonus += 0.25
        elif re.search(r'\d+', sec_core):
            sec_num = re.search(r'\d+[a-z]?(?:\(\d+\))?', sec_core).group(0)
            if re.search(r'\b' + re.escape(sec_num) + r'\b', q_lower):
                exact_bonus += 0.25

    if cit:
        cit_core = cit.split(":")[0].strip()
        if re.search(r'\b' + re.escape(cit_core) + r'\b', q_lower):
            exact_bonus += 0.25

    if act:
        act_core = act.split(",")[0].strip()
        if re.search(r'\b' + re.escape(act) + r'\b', q_lower) or re.search(r'\b' + re.escape(act_core) + r'\b', q_lower):
            exact_bonus += 0.20

    # Primary Statute Priority Boost: Primary legislation matching statutory provision receives hierarchy priority
    if is_primary_statute and exact_bonus > 0:
        auth_bonus += 0.30

    # Strict Relevance Guard: If specific subject terms/numbers exist in query but 0 match chunk/meta, cap score
    has_subject_match = bool(matched_specific or exact_bonus > 0)
    if specific_keywords and not has_subject_match:
        return 0.10

    # 5. Currentness Bonus
    curr_info = verify_currentness(meta)
    curr_bonus = 0.1 if curr_info["is_current"] else (-0.3 if curr_info["currentness"] in ["REPEALED", "SUPERSEDED"] else 0.0)

    final_score = (
        (0.35 * sem_score) +
        (0.20 * lexical_score) +
        (0.30 * auth_bonus) +
        (0.10 * exact_bonus) +
        (0.05 * curr_bonus)
    )

    return round(max(0.05, min(0.99, final_score)), 3)


def _build_match_dict(doc: str, meta: dict, dist: float, doc_id: str, query_text: str) -> Dict[str, Any]:
    """Constructs a normalized match result dict with complete Phase 7 provenance metadata."""
    score = _calculate_hybrid_score(query_text, doc, meta, dist)
    court_name = meta.get("court") or "Supreme Court of India"
    case_num = meta.get("citation") or meta.get("case_number") or meta.get("case_name") or f"Citation #{doc_id}"

    curr_info = verify_currentness(meta)

    return {
        "chunk_id": meta.get("chunk_id", doc_id),
        "excerpt": doc,
        "relevance_score": score,
        "document_id": meta.get("document_id") or meta.get("doc_id", doc_id),
        "document_name": meta.get("title") or meta.get("document_name", "Legal Document"),
        "title": meta.get("title") or meta.get("document_name", "Legal Document"),
        "case_name": meta.get("case_name") or meta.get("title", "Precedent Case"),
        "case_number": case_num,
        "citation": meta.get("citation") or case_num,
        "case_id": meta.get("case_id", ""),
        "court": court_name,
        "year": int(meta.get("year", 2026)),
        "page_number": int(meta.get("page_number", 1)),
        "paragraph_number": str(meta.get("paragraph_number") or ""),
        "source": meta.get("source_name") or meta.get("source", "Legal Record"),
        "source_url": meta.get("source_url") or "",
        "authority_level": int(meta.get("authority_level") or 1),
        "jurisdiction": meta.get("jurisdiction") or "India",
        "act": meta.get("act") or "",
        "section": meta.get("section") or "",
        "chapter": meta.get("chapter") or "",
        "status": meta.get("status") or CurrentnessStatus.IN_FORCE.value,
        "currentness": curr_info["currentness"],
        "is_current": curr_info["is_current"],
        "currentness_explanation": curr_info["explanation"],
        "corpus": meta.get("corpus") or ("CASE_SCOPED" if meta.get("case_id") else "GLOBAL_STATUTES"),
        "document_type": meta.get("document_type") or ("STATUTE" if (int(meta.get("authority_level") or 1) == 1 or meta.get("corpus") == "GLOBAL_STATUTES") else "CASE_DOCUMENT"),
        "content_hash": meta.get("content_hash") or "",
        "chunk_index": meta.get("chunk_index", 0),
        "total_chunks": meta.get("total_chunks", 1),
        "why_it_is_relevant": f"Matches query concepts with Level {meta.get('authority_level', 1)} authority score {score}."
    }


MIN_RELEVANCE_THRESHOLD = 0.35


def search_similar_documents(
    query_text: str,
    top_k: int = 5,
    case_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Phase 7 Hybrid RAG Retrieval Engine with Strict Collection / Metadata Scoping.

    CASE ISOLATION CONTRACT:
    - If case_id is non-empty: Retrieve ONLY chunks with case_id == requested case_id.
    - If case_id is None / empty: Retrieve ONLY global legal corpus chunks (case_id == "").
      Case-scoped documents NEVER leak into global searches.
    """
    if not query_text or not query_text.strip():
        return []

    scoped = bool(case_id and str(case_id).strip())
    matches: List[Dict[str, Any]] = []

    if collection:
        try:
            query_kwargs: Dict[str, Any] = {"n_results": top_k * 2}  # overfetch for hybrid reranking

            if scoped:
                # STRICT CASE-SCOPED FILTER
                query_kwargs["where"] = {"case_id": {"$eq": str(case_id)}}
            else:
                # STRICT GLOBAL LEGAL CORPUS FILTER (no private case leakage)
                query_kwargs["where"] = {"case_id": {"$eq": ""}}

            query_embedding = _get_cached_query_embedding(query_text)
            if query_embedding:
                results = collection.query(
                    query_embeddings=query_embedding,
                    **query_kwargs,
                )
            else:
                results = collection.query(
                    query_texts=[query_text],
                    **query_kwargs,
                )

            if results and results.get("documents") and results["documents"][0]:
                docs = results["documents"][0]
                metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
                distances = results["distances"][0] if results.get("distances") else [0.2] * len(docs)
                ids = results["ids"][0] if results.get("ids") else [f"doc_{i}" for i in range(len(docs))]

                for doc, meta, dist, doc_id in zip(docs, metas, distances, ids):
                    chunk_case_id = meta.get("case_id", "")
                    if scoped and chunk_case_id != str(case_id):
                        logger.error(f"[SECURITY] Discarding cross-case chunk {doc_id} (wanted {case_id}, got {chunk_case_id})")
                        continue
                    if not scoped and chunk_case_id != "":
                        logger.error(f"[SECURITY] Discarding private case chunk {doc_id} from global search")
                        continue

                    match = _build_match_dict(doc, meta, dist, doc_id, query_text)
                    if match["relevance_score"] >= MIN_RELEVANCE_THRESHOLD:
                        matches.append(match)

                # Hybrid score reranking
                return sorted(matches, key=lambda x: x["relevance_score"], reverse=True)[:top_k]

        except Exception as e:
            logger.warning("[RAG RETRIEVAL] Persistent collection query notice: %s", e)

    # ── In-memory store fallback ────────────────────────────────────────────────
    for item in in_memory_store:
        meta = item.get("metadata", {})
        chunk_case_id = meta.get("case_id", "")

        if scoped and chunk_case_id != str(case_id):
            continue
        if not scoped and chunk_case_id != "":
            continue

        text = item.get("text", "")
        match = _build_match_dict(text, meta, 0.3, item.get("id", "chunk_1"), query_text)
        if match["relevance_score"] >= MIN_RELEVANCE_THRESHOLD:
            matches.append(match)

    return sorted(matches, key=lambda x: x["relevance_score"], reverse=True)[:top_k]
