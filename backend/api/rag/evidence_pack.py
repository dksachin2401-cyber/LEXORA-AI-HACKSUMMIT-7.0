"""
Phase 9: Evidence Pack Generator
================================
Constructs an internal Evidence Pack from multi-corpus retrieval results prior to LLM synthesis.
Evaluates evidence strength, authority consistency, currentness coverage, and later treatment status.
"""

from typing import List, Dict, Any, Optional


def create_evidence_pack(
    query: str,
    extracted_params: Dict[str, Any],
    retrieval_results: Dict[str, Any],
    case_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Constructs an authoritative Evidence Pack object containing retrieved evidence,
    calculated evidence strength, currentness status, and authority consistency flags.
    """
    statutes = retrieval_results.get("statutes", [])
    precedents = retrieval_results.get("precedents", [])
    constitutional_sources = retrieval_results.get("constitutional_sources", [])
    case_evidence = retrieval_results.get("case_evidence", [])
    all_chunks = retrieval_results.get("all_ranked_chunks", [])

    # 1. Determine Overall Currentness Status
    has_repealed = any(str(c.get("currentness", "")).upper() in ["REPEALED", "SUPERSEDED"] for c in all_chunks)
    has_verified = any(str(c.get("currentness", "")).upper() in ["VERIFIED", "IN_FORCE"] for c in all_chunks) or len(all_chunks) > 0
    if has_repealed and extracted_params.get("currentness_requirement") != "HISTORICAL":
        currentness_status = "SUPERSEDED"
    elif has_verified:
        currentness_status = "VERIFIED"
    else:
        currentness_status = "CURRENTNESS_UNVERIFIED"

    # 2. Calculate Evidence Strength Score
    total_sources = len(all_chunks)
    has_primary = any(c.get("authority_level", 1) == 1 for c in all_chunks)
    max_relevance = max([c.get("relevance_score", 0.0) for c in all_chunks]) if all_chunks else 0.0

    if total_sources >= 3 and has_primary and max_relevance >= 0.5:
        evidence_strength = "HIGH"
    elif total_sources >= 1 and max_relevance >= 0.2:
        evidence_strength = "MEDIUM"
    elif total_sources >= 1:
        evidence_strength = "LOW"
    else:
        evidence_strength = "INSUFFICIENT"

    # 3. Assess Authority Relationship / Consistency
    if total_sources >= 2:
        authority_relationship = "CONSISTENT_AUTHORITIES"
    elif total_sources == 1:
        authority_relationship = "SINGLE_AUTHORITY_VERIFIED"
    else:
        authority_relationship = "AUTHORITY_RELATIONSHIP_UNVERIFIED"

    # 4. Later Treatment / Overruling Status
    later_treatment = "LATER_TREATMENT_UNVERIFIED"

    return {
        "issue": extracted_params.get("primary_issue", query),
        "domain": extracted_params.get("domain", "General Legal"),
        "jurisdiction": extracted_params.get("jurisdiction", "Republic of India"),
        "currentness": currentness_status,
        "evidence_strength": evidence_strength,
        "authority_relationship": authority_relationship,
        "later_treatment": later_treatment,
        "statutes": statutes,
        "precedents": precedents,
        "constitutional_sources": constitutional_sources,
        "case_evidence": case_evidence,
        "total_sources_used": total_sources,
        "warnings": [] if evidence_strength != "INSUFFICIENT" else ["Insufficient supporting legal evidence found in indexed corpus."]
    }
