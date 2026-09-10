"""
Phase 7: Currentness & Versioning Engine
========================================
Tracks statute and judgment lifecycle statuses:
IN_FORCE, REPEALED, SUPERSEDED, HISTORICAL, PARTIALLY_IN_FORCE, CURRENTNESS_UNVERIFIED, UNKNOWN.
"""

from typing import Dict, Any, Optional
import datetime
from rag.corpus_metadata import CurrentnessStatus


def verify_currentness(metadata: Dict[str, Any], query_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Evaluates statutory currentness based on effective date, repeal date, and metadata status.
    Returns status and currentness explanation.
    """
    status = metadata.get("status") or CurrentnessStatus.UNKNOWN.value
    eff_date = metadata.get("effective_date")
    repeal_date = metadata.get("repeal_date")

    today_str = datetime.date.today().isoformat()
    target_date = query_date or today_str

    if status == CurrentnessStatus.REPEALED.value:
        return {
            "currentness": CurrentnessStatus.REPEALED.value,
            "is_current": False,
            "explanation": f"Act / provision was repealed on {repeal_date or 'historical date'}. Not currently in force."
        }

    if status == CurrentnessStatus.SUPERSEDED.value:
        return {
            "currentness": CurrentnessStatus.SUPERSEDED.value,
            "is_current": False,
            "explanation": "Act / provision has been superseded by newer statutory legislation (e.g. BNS/BNSS/BSA)."
        }

    if status == CurrentnessStatus.HISTORICAL.value:
        return {
            "currentness": CurrentnessStatus.HISTORICAL.value,
            "is_current": False,
            "explanation": "Historical statute version."
        }

    if status == CurrentnessStatus.IN_FORCE.value:
        if repeal_date and target_date >= repeal_date:
            return {
                "currentness": CurrentnessStatus.REPEALED.value,
                "is_current": False,
                "explanation": f"Provision was repealed as of {repeal_date}."
            }
        return {
            "currentness": CurrentnessStatus.IN_FORCE.value,
            "is_current": True,
            "explanation": "Provision is currently in force under Indian jurisprudence."
        }

    # If currentness cannot be conclusively established
    return {
        "currentness": CurrentnessStatus.CURRENTNESS_UNVERIFIED.value,
        "is_current": False,
        "explanation": "Statutory currentness could not be verified from available metadata."
    }
