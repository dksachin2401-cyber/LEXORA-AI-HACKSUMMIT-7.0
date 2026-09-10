import re
from typing import Dict, Any, List, Optional

def extract_fact_pattern(query: str, history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Extracts structured fact parameters (actor, action, object, location, intent, potential_damage)
    from natural-language hypothetical or scenario-based legal queries.
    """
    q = (query or "").strip()
    q_lower = q.lower()

    # Consolidate turn history for multi-turn hypothetical context
    full_text = q
    if history:
        for turn in history[-3:]:
            msg = turn.get("text") or turn.get("message") or turn.get("content") or ""
            full_text = f"{msg} {full_text}"
    full_lower = full_text.lower()

    # 1. Identify Actor
    actor = "Individual"
    if re.search(r"\b(i\b|my\b)", q_lower):
        actor = "User / Individual"
    elif "tenant" in full_lower:
        actor = "Tenant"
    elif "landlord" in full_lower:
        actor = "Landlord"
    elif "minor" in full_lower:
        actor = "Minor (Under 18 Years)"
    elif "person" in full_lower:
        actor = "Person / Citizen"
    elif "friend" in full_lower:
        actor = "Friend / Borrower"
    elif "employer" in full_lower:
        actor = "Employer"

    # 2. Identify Intent (Mens Rea / Negligence / Innocent)
    intent = "Unspecified / Intent Requires Determination"
    if re.search(r"\b(accidental|accidentally|unintentionally|mistake|by mistake)\b", full_lower):
        intent = "Accidental / Lack of Malicious Intent (Negligence / Absence of Mens Rea)"
    elif re.search(r"\b(intentional|intentionally|deliberately|willfully|knowingly)\b", full_lower):
        intent = "Intentional / Deliberate (Presence of Mens Rea / Malice)"

    # 3. Identify Object / Subject Matter
    obj = "Property or Legal Relationship in Question"
    if "vase" in full_lower:
        obj = "Museum / Private Artifact (Vase)"
    elif "car" in full_lower or "vehicle" in full_lower:
        obj = "Borrowed Vehicle / Motor Property"
    elif "contract" in full_lower or "agreement" in full_lower:
        obj = "Contractual Document / Written Agreement"
    elif "lease" in full_lower or "rent" in full_lower or "property" in full_lower:
        obj = "Leased Real Property Premises"
    elif "arrest" in full_lower or "police" in full_lower:
        obj = "Personal Liberty / Constitutional Rights"

    # 4. Identify Location / Context
    location = "Unspecified Jurisdiction / Location"
    if "museum" in full_lower:
        location = "Public Museum / Exhibition Space"
    elif "lease" in full_lower or "tenant" in full_lower or "rent" in full_lower:
        location = "Residential / Commercial Leased Premises"

    # 5. Identify Potential Damage / Legal Issue Area
    damage = "Potential statutory or civil liability"
    if re.search(r"\b(broke|damage|damaged|destroy)\b", full_lower):
        if "accidental" in intent.lower():
            damage = "Tortious Negligence / Civil Compensation for Property Damage"
        else:
            damage = "Property Damage / Civil Compensation vs. Criminal Mischief"
    elif "contract" in full_lower:
        if "minor" in actor.lower():
            damage = "Contractual Enforceability / Capacity of Minor"
        else:
            damage = "Contract Validity / Binding Effect of Unread Terms"
    elif "lease" in full_lower:
        damage = "Breach of Lease Agreement / Liability for Unexpired Term Rent"
    elif "arrest" in full_lower:
        damage = "Procedural Violation of Fundamental Rights / Procedural Safeguards"

    return {
        "actor": actor,
        "action": q,
        "object": obj,
        "location": location,
        "intent": intent,
        "potential_damage": damage
    }
