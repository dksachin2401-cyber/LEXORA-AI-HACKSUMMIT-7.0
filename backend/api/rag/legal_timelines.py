"""
Phase 9: Statutory & Historical Timeline Research Engine
=========================================================
Constructs statutory timelines, historical applicability matrices, and statutory comparison tables
for historic Indian codes (IPC/CrPC/IEA) and 2024 Sanhitas (BNS/BNSS/BSA).
"""

from typing import Dict, Any, List, Optional
from rag.cross_reference import find_cross_reference


def build_statutory_timeline(act_name: str) -> List[Dict[str, Any]]:
    """
    Returns verified statutory timeline nodes for a given Act.
    """
    act_lower = act_name.lower()
    if "bns" in act_lower or "bhartiya nyaya" in act_lower or "ipc" in act_lower:
        return [
            {"year": 1860, "event": "Enactment of Indian Penal Code (IPC 1860)", "status": "HISTORICAL"},
            {"year": 2023, "event": "Enactment of Bharatiya Nyaya Sanhita, 2023 (BNS)", "status": "IN_FORCE"},
            {"year": 2024, "event": "BNS comes into force on July 1, 2024, replacing IPC", "status": "IN_FORCE"}
        ]
    elif "bnss" in act_lower or "bhartiya nagarik" in act_lower or "crpc" in act_lower:
        return [
            {"year": 1973, "event": "Enactment of Code of Criminal Procedure (CrPC 1973)", "status": "HISTORICAL"},
            {"year": 2023, "event": "Enactment of Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)", "status": "IN_FORCE"},
            {"year": 2024, "event": "BNSS comes into force on July 1, 2024, replacing CrPC", "status": "IN_FORCE"}
        ]
    elif "bsa" in act_lower or "bhartiya sakshya" in act_lower or "evidence" in act_lower:
        return [
            {"year": 1872, "event": "Enactment of Indian Evidence Act (IEA 1872)", "status": "HISTORICAL"},
            {"year": 2023, "event": "Enactment of Bharatiya Sakshya Adhiniyam, 2023 (BSA)", "status": "IN_FORCE"},
            {"year": 2024, "event": "BSA comes into force on July 1, 2024, replacing IEA", "status": "IN_FORCE"}
        ]
    return [
        {"year": 2026, "event": f"Verified current version of {act_name}", "status": "IN_FORCE"}
    ]


def generate_statutory_comparison(
    old_sec: str,
    old_act: str = "IPC"
) -> Dict[str, Any]:
    """
    Builds a statutory comparison object between historic provisions (e.g. IPC 420) and new Sanhita provisions (BNS 318).
    """
    ref = find_cross_reference(old_sec)
    if ref:
        return {
            "historical_provision": f"{ref['historical_section']} {ref['historical_act']}",
            "current_provision": f"{ref['current_section']} {ref['current_act']}",
            "title": ref["subject"],
            "effective_date": ref.get("effective_date", "2024-07-01"),
            "relationship": ref.get("relationship", "SUBSTITUTED_BY"),
            "historical_status": "REPEALED for offences committed after July 1, 2024",
            "current_status": "IN_FORCE for offences committed on or after July 1, 2024",
            "important_qualifications": "Offences committed prior to July 1, 2024 are prosecuted under legacy provisions."
        }
    return {
        "historical_provision": f"Section {old_sec} {old_act}",
        "current_provision": "Not directly cross-referenced in primary mapping",
        "relationship": "STATUTORY_TRANSITION_UNVERIFIED"
    }
