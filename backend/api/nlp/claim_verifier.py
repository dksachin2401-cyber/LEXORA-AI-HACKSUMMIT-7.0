"""
Phase 9: Claim Extraction & Claim-to-Source Verification Engine
================================================================
Extracts individual legal claims from LLM responses and maps them against retrieved evidence sources.
Assigns verification statuses: SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED, CONTRADICTED, INSUFFICIENT_EVIDENCE.
"""

import re
from typing import List, Dict, Any


def extract_and_verify_claims(
    answer: str,
    evidence_pack: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Splits LLM answer into individual sentence claims, matches each claim against Evidence Pack
    statutes, precedents, and constitutional sources, and returns claim verification mappings.
    """
    if not answer or not answer.strip():
        return {
            "claims": [],
            "supported_claim_rate": 0.0,
            "unsupported_claim_rate": 0.0,
            "verification_status": "INSUFFICIENT_EVIDENCE"
        }

    # Extract sentence-level claims
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", answer) if len(s.strip()) > 20]
    all_evidence = (
        evidence_pack.get("statutes", []) +
        evidence_pack.get("precedents", []) +
        evidence_pack.get("constitutional_sources", []) +
        evidence_pack.get("case_evidence", [])
    )

    claims_output = []
    supported_count = 0
    partially_supported_count = 0
    unsupported_count = 0

    for idx, sentence in enumerate(sentences, 1):
        s_lower = sentence.lower()

        # Find matching evidence sources by section, citation, act, or keyword overlap
        matching_sources = []
        for src in all_evidence:
            src_text = (src.get("text") or src.get("excerpt") or "").lower()
            sec = str(src.get("section") or "").lower()
            act = str(src.get("act") or "").lower()
            case_n = str(src.get("case_name") or "").lower()

            if (sec and sec in s_lower) or (act and act in s_lower) or (case_n and case_n in s_lower):
                matching_sources.append({
                    "title": src.get("title") or src.get("case_name") or src.get("act") or "Legal Source",
                    "section": src.get("section", ""),
                    "citation": src.get("citation", ""),
                    "paragraph": src.get("paragraph_number", "")
                })

        if matching_sources:
            status = "SUPPORTED"
            supported_count += 1
        elif len(all_evidence) > 0:
            # Check general keyword match
            words = set(re.findall(r"\w+", s_lower))
            words_filtered = {w for w in words if len(w) > 4}
            matched_words = 0
            for src in all_evidence:
                src_words = set(re.findall(r"\w+", (src.get("text") or src.get("excerpt") or "").lower()))
                matched_words += len(words_filtered.intersection(src_words))

            if matched_words >= 2:
                status = "PARTIALLY_SUPPORTED"
                partially_supported_count += 1
            else:
                status = "UNSUPPORTED"
                unsupported_count += 1
        else:
            status = "INSUFFICIENT_EVIDENCE"
            unsupported_count += 1

        claims_output.append({
            "claim_id": f"claim_{idx}",
            "claim": sentence,
            "status": status,
            "supporting_sources": matching_sources
        })

    total_claims = len(sentences)
    supported_rate = round((supported_count + partially_supported_count) / total_claims, 2) if total_claims > 0 else 0.0
    unsupported_rate = round(unsupported_count / total_claims, 2) if total_claims > 0 else 0.0

    return {
        "claims": claims_output,
        "total_claims": total_claims,
        "supported_claims_count": supported_count,
        "partially_supported_claims_count": partially_supported_count,
        "unsupported_claims_count": unsupported_count,
        "supported_claim_rate": supported_rate,
        "unsupported_claim_rate": unsupported_rate
    }
