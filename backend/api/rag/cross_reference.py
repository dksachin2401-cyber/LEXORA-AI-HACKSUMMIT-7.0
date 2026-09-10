"""
Phase 8: Authoritative Legal Cross-Reference & Statutory Transition Engine
==========================================================================
Maps relationships between current Sanhitas (BNS/BNSS/BSA) and historical codes (IPC/CrPC/IEA).
Provides verified statutory cross-references for legal query understanding and comparison.
"""

from typing import Dict, Any, Optional, List

# Explicit verified mapping of statutory provisions between historical codes and current Sanhitas
CROSS_REFERENCE_MAP: List[Dict[str, Any]] = [
    {
        "historical_act": "Indian Penal Code, 1860",
        "historical_section": "Section 302",
        "current_act": "Bharatiya Nyaya Sanhita, 2023",
        "current_section": "Section 103",
        "subject": "Punishment for murder",
        "relationship": "SUBSTITUTED_BY",
        "effective_date": "2024-07-01"
    },
    {
        "historical_act": "Indian Penal Code, 1860",
        "historical_section": "Section 304A",
        "current_act": "Bharatiya Nyaya Sanhita, 2023",
        "current_section": "Section 106",
        "subject": "Causing death by negligence",
        "relationship": "SUBSTITUTED_BY",
        "effective_date": "2024-07-01"
    },
    {
        "historical_act": "Indian Penal Code, 1860",
        "historical_section": "Section 420",
        "current_act": "Bharatiya Nyaya Sanhita, 2023",
        "current_section": "Section 318",
        "subject": "Cheating and dishonestly inducing delivery of property",
        "relationship": "SUBSTITUTED_BY",
        "effective_date": "2024-07-01"
    },
    {
        "historical_act": "Code of Criminal Procedure, 1973",
        "historical_section": "Section 41",
        "current_act": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "current_section": "Section 35",
        "subject": "When police may arrest without warrant & notice safeguards",
        "relationship": "SUBSTITUTED_BY",
        "effective_date": "2024-07-01"
    },
    {
        "historical_act": "Code of Criminal Procedure, 1973",
        "historical_section": "Section 438",
        "current_act": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "current_section": "Section 482",
        "subject": "Anticipatory bail / direction for grant of bail to person apprehending arrest",
        "relationship": "SUBSTITUTED_BY",
        "effective_date": "2024-07-01"
    },
    {
        "historical_act": "Code of Criminal Procedure, 1973",
        "historical_section": "Section 437",
        "current_act": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "current_section": "Section 480",
        "subject": "Bail in non-bailable offences",
        "relationship": "SUBSTITUTED_BY",
        "effective_date": "2024-07-01"
    },
    {
        "historical_act": "Indian Evidence Act, 1872",
        "historical_section": "Section 65B",
        "current_act": "Bharatiya Sakshya Adhiniyam, 2023",
        "current_section": "Section 63",
        "subject": "Admissibility and certificate requirement for electronic records",
        "relationship": "SUBSTITUTED_BY",
        "effective_date": "2024-07-01"
    }
]


def find_cross_reference(act_or_sec: str) -> Optional[Dict[str, Any]]:
    """
    Finds verified statutory cross-reference mapping for an Act or Section query.
    """
    if not act_or_sec:
        return None

    clean = act_or_sec.strip().lower()
    for ref in CROSS_REFERENCE_MAP:
        if (ref["historical_section"].lower() in clean or ref["current_section"].lower() in clean or
            ref["subject"].lower() in clean):
            return ref

    return None


def get_all_cross_references() -> List[Dict[str, Any]]:
    """Returns all verified statutory cross-references."""
    return CROSS_REFERENCE_MAP
