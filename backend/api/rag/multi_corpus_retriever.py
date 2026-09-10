"""
Phase 9: Multi-Corpus Retrieval & Authority Reranking Engine
============================================================
Executes multi-source parallel retrieval across target corpora (GLOBAL_STATUTES,
GLOBAL_PRECEDENTS, GLOBAL_CONSTITUTION, GLOBAL_PROCEDURE, CASE_SCOPED).
Enforces authority filtering, currentness weighting, and strict case isolation.
"""

import logging
from typing import List, Dict, Any, Optional
from rag.retrieve import search_similar_documents
from rag.query_expansion import rank_and_deduplicate_chunks
from rag.currentness import verify_currentness

logger = logging.getLogger(__name__)


def execute_multi_corpus_retrieval(
    sub_tasks: List[Dict[str, Any]],
    case_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes retrieval across decomposed sub-tasks and groups evidence by corpus type:
    - statutes: List of statutory chunks
    - precedents: List of precedent judgment chunks
    - constitutional_sources: List of constitutional article chunks
    - case_evidence: List of isolated case record chunks
    - all_chunks: Deduplicated, authority-ranked unified list
    """
    retrieved_by_task: Dict[str, List[Dict[str, Any]]] = {}
    statutes = []
    precedents = []
    constitutional_sources = []
    case_evidence = []
    all_raw_chunks = []

    for task in sub_tasks:
        t_id = task["task_id"]
        t_corpus = task["target_corpus"]
        t_query = task["query"]
        t_max = task["max_results"]

        chunks = []
        if t_corpus == "CASE_SCOPED":
            if case_id and str(case_id).strip():
                chunks = search_similar_documents(t_query, top_k=t_max, case_id=str(case_id).strip())
        else:
            chunks = search_similar_documents(t_query, top_k=t_max, case_id=None)

        # Categorize retrieved chunks into logical corpora
        for c in chunks:
            c["retrieved_for_task"] = t_id
            corpus_tag = c.get("corpus") or c.get("document_type") or t_corpus
            c["corpus"] = corpus_tag

            # Verify statutory currentness on metadata
            cur_res = verify_currentness(c)
            if isinstance(cur_res, dict):
                c["currentness"] = "VERIFIED" if cur_res.get("is_current") else cur_res.get("currentness", "CURRENTNESS_UNVERIFIED")
            else:
                c["currentness"] = str(cur_res)

            all_raw_chunks.append(c)

            if c.get("case_id") and c.get("case_id") == str(case_id).strip():
                case_evidence.append(c)
            elif "statute" in str(corpus_tag).lower() or c.get("act"):
                statutes.append(c)
            elif "precedent" in str(corpus_tag).lower() or "judgment" in str(corpus_tag).lower() or "v." in str(c.get("case_name", "")).lower():
                precedents.append(c)
            elif "constitution" in str(corpus_tag).lower() or "article" in str(c.get("title", "")).lower():
                constitutional_sources.append(c)

    # Prioritize case_evidence at top for case-scoped queries
    ranked_chunks = case_evidence + rank_and_deduplicate_chunks(all_raw_chunks, top_k=10)
    dedup_ranked = []
    seen_ids = set()
    for item in ranked_chunks:
        cid = item.get("chunk_id") or item.get("document_id") or item.get("text", "")[:50]
        if cid not in seen_ids:
            seen_ids.add(cid)
            dedup_ranked.append(item)

    return {
        "statutes": rank_and_deduplicate_chunks(statutes, top_k=5),
        "precedents": rank_and_deduplicate_chunks(precedents, top_k=5),
        "constitutional_sources": rank_and_deduplicate_chunks(constitutional_sources, top_k=3),
        "case_evidence": rank_and_deduplicate_chunks(case_evidence, top_k=4),
        "all_ranked_chunks": dedup_ranked,
        "total_retrieved": len(all_raw_chunks)
    }
