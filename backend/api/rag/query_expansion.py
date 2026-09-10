import re
from typing import List, Dict, Any

def expand_legal_query(query: str) -> List[str]:
    """
    Rewrites a legal query into expanded retrieval search terms without changing the user's intent.
    Original query is always retained at index 0.
    """
    clean_q = (query or "").strip()
    if not clean_q:
        return [clean_q]

    expansions = [clean_q]
    q_lower = clean_q.lower()

    # Query expansion patterns
    if "anticipatory bail" in q_lower:
        expansions.extend([
            "Section 438 CrPC anticipatory bail principles",
            "cancellation of anticipatory bail grounds Supreme Court",
            "pre-arrest bail conditions and statutory compliance"
        ])
    elif "bail" in q_lower:
        expansions.extend([
            "bailable non-bailable offense bail requirements",
            "Section 437 Section 439 CrPC bail jurisprudence"
        ])
    elif "cheque bounce" in q_lower or "138 ni act" in q_lower:
        expansions.extend([
            "Section 138 Negotiable Instruments Act statutory notice 15 days",
            "dishonour of cheque demand notice precedent"
        ])
    elif "writ petition" in q_lower:
        expansions.extend([
            "Article 226 Article 32 constitutional writ jurisdiction",
            "mandamus habeas corpus certiorari prohibition"
        ])
    elif "licence" in q_lower or "license" in q_lower or "drive without" in q_lower or "driving" in q_lower:
        expansions.extend([
            "Section 3 Motor Vehicles Act 1988 necessity for driving licence",
            "Section 181 Motor Vehicles Act driving without effective licence penalty",
            "Motor Vehicles Act driving licence requirement prohibition public place"
        ])
    elif "vase" in q_lower or "damage" in q_lower or "property" in q_lower or "broke" in q_lower:
        expansions.extend([
            "Section 425 Indian Penal Code Bharatiya Nyaya Sanhita mischief damage to property",
            "tortious negligence compensation for property damage strict liability",
            "mens rea intention accidental damage to property"
        ])
    elif "borrowed" in q_lower or "car" in q_lower or "vehicle" in q_lower:
        expansions.extend([
            "Section 151 Indian Contract Act bailment duty of care bailee liability",
            "borrowed vehicle negligence property damage compensation"
        ])
    elif "contract" in q_lower or "without reading" in q_lower:
        expansions.extend([
            "Section 10 Section 13 Indian Contract Act valid consent free consent mistake",
            "non est factum binding nature of signed agreement"
        ])
    elif "tenant" in q_lower or "lease" in q_lower:
        expansions.extend([
            "Transfer of Property Act breach of lease agreement rent liability lock-in period",
            "termination of tenancy notice rights of landlord tenant"
        ])
    elif "arrest" in q_lower or "informed" in q_lower or "grounds" in q_lower:
        expansions.extend([
            "Article 22 Constitution of India Section 50 CrPC BNSS mandatory grounds of arrest",
            "right to be informed of grounds of arrest constitutional safeguards"
        ])
    elif "minor" in q_lower:
        expansions.extend([
            "Section 11 Indian Contract Act capacity to contract minor contract void ab initio",
            "Mohori Bibee precedent minor liability"
        ])

    return list(dict.fromkeys(expansions))


def compute_question_relevance_score(chunk: Dict[str, Any], query: str = "") -> float:
    """
    Calculates Question-Relevance Score by prioritizing primary statutes, direct statutory matches,
    and penalizing off-topic insurance/secondary cases.
    """
    try:
        base_score = float(chunk.get("score") or chunk.get("relevance_score") or 0.5)
    except Exception:
        base_score = 0.5

    if not query:
        return base_score

    q_lower = query.lower()
    text_lower = (chunk.get("excerpt") or chunk.get("text") or "").lower()
    act_lower = str(chunk.get("act") or chunk.get("document_name") or "").lower()

    boost = 0.0

    # Authority level boost: Primary Statutes (Level 1) get +0.30 boost
    auth_level = int(chunk.get("authority_level") or 2)
    if auth_level == 1 or "statute" in str(chunk.get("corpus", "")).lower() or chunk.get("act"):
        boost += 0.30

    # Specific Question Concept Boosts
    if any(k in q_lower for k in ["drive", "licence", "license"]):
        # Section 3 MVA (Necessity of driving licence) is the PRIMARY statutory rule
        if "section 3" in text_lower or "section 3" in act_lower:
            boost += 0.45
        # Section 181 MVA (Penalty for driving without licence) is the PRIMARY penalty rule
        elif "section 181" in text_lower or "section 181" in act_lower:
            boost += 0.35
        elif "motor vehicles act" in act_lower or "motor vehicles act" in text_lower:
            boost += 0.25

        # Penalize insurance cases (like Swaran Singh) when query asks a direct driving licence question
        if "national insurance" in text_lower or "swaran singh" in text_lower or "third party liability" in text_lower:
            boost -= 0.35

    # Direct query term overlap boost
    stop_words = {"what", "when", "where", "without", "with", "from", "have", "can", "could", "would", "does", "should"}
    query_words = [w for w in re.findall(r"\w+", q_lower) if len(w) > 3 and w not in stop_words]
    if query_words:
        matches = sum(1 for w in query_words if w in text_lower or w in act_lower)
        boost += (matches / len(query_words)) * 0.20

    return base_score + boost


def rank_and_deduplicate_chunks(chunks: List[Dict[str, Any]], top_k: int = 4, query: str = "") -> List[Dict[str, Any]]:
    """
    Deduplicates chunks based on content fingerprinting and sorts by Question Relevance Score.
    """
    if not chunks:
        return []

    seen_fingerprints = set()
    unique_chunks = []

    for chunk in chunks:
        text = chunk.get("excerpt") or chunk.get("text") or ""
        # Fingerprint: first 60 chars stripped
        fingerprint = text[:60].strip().lower()
        if fingerprint and fingerprint not in seen_fingerprints:
            seen_fingerprints.add(fingerprint)
            unique_chunks.append(chunk)

    # Sort by Question Relevance Score descending
    unique_chunks.sort(key=lambda x: compute_question_relevance_score(x, query), reverse=True)
    return unique_chunks[:top_k]
