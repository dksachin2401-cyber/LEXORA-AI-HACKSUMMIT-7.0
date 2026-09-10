"""
Phase 9: Legal Issue Extraction Engine
=======================================
Extracts structured legal parameters from complex legal questions:
- Legal Domain (Criminal, Civil, Constitutional, Contract, Commercial, Family, Cyber, Corporate, Arbitration, etc.)
- Jurisdiction & Courts
- Primary Legal Issue
- Relevant Acts & Sections
- Procedural & Factual Issues
- Precedent & Currentness Requirements
- Research Depth (QUICK, STANDARD, DEEP)
"""

import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class LegalIssueParameters(BaseModel):
    domain: str
    jurisdiction: str
    primary_issue: str
    relevant_acts: List[str]
    relevant_sections: List[str]
    procedural_issue: Optional[str] = None
    factual_issue: Optional[str] = None
    precedent_required: bool = True
    currentness_requirement: str = "CURRENT"  # CURRENT, HISTORICAL, TRANSITIONAL
    target_year: Optional[int] = None
    research_depth: str = "STANDARD"  # QUICK, STANDARD, DEEP


def extract_legal_issues(
    query: str,
    research_depth: str = "STANDARD",
    user_role: str = "CITIZEN"
) -> Dict[str, Any]:
    """
    Parses user question and extracts structured legal domain, statutory references,
    jurisdiction, and research intent parameters.
    """
    q = query.strip()
    q_lower = q.lower()

    # 1. Identify Domain
    domain = "General Legal"
    if any(k in q_lower for k in ["constitution", "article", "writ", "fundamental right", "basic structure", "300a"]):
        domain = "Constitutional Law"
    elif any(k in q_lower for k in ["arrest", "bail", "fir", "police", "investigation", "warrant", "undertrial", "bnss", "crpc"]):
        domain = "Criminal Procedure"
    elif any(k in q_lower for k in ["murder", "cheating", "theft", "extortion", "robbery", "bns", "ipc", "offence", "crime"]):
        domain = "Criminal Law (Substantive)"
    elif any(k in q_lower for k in ["evidence", "witness", "confession", "electronic record", "65b", "bsa", "proof"]):
        domain = "Law of Evidence"
    elif any(k in q_lower for k in ["cpc", "plaint", "injunction", "res judicata", "written statement", "civil suit"]):
        domain = "Civil Procedure & Remedies"
    elif any(k in q_lower for k in ["contract", "agreement", "damages", "frustration", "breach", "consideration"]):
        domain = "Contract Law"
    elif any(k in q_lower for k in ["cheque", "138", "ni act", "arbitration", "company", "ibc", "consumer", "it act"]):
        domain = "Commercial & Financial Law"
    elif any(k in q_lower for k in ["divorce", "maintenance", "custody", "marriage", "succession", "hma"]):
        domain = "Family & Personal Law"
    elif any(k in q_lower for k in ["accident", "motor", "mva", "compensation", "strict liability", "negligence"]):
        domain = "Tort & Motor Accident Law"

    # 2. Extract Acts & Sections
    acts = []
    if "bns" in q_lower or "bhartiya nyaya" in q_lower:
        acts.append("Bharatiya Nyaya Sanhita, 2023 (BNS)")
    if "bnss" in q_lower or "bhartiya nagarik" in q_lower:
        acts.append("Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)")
    if "bsa" in q_lower or "bhartiya sakshya" in q_lower:
        acts.append("Bharatiya Sakshya Adhiniyam, 2023 (BSA)")
    if "constitution" in q_lower or "article" in q_lower:
        acts.append("Constitution of India")
    if "ipc" in q_lower or "penal code" in q_lower:
        acts.append("Indian Penal Code, 1860 (IPC)")
    if "crpc" in q_lower:
        acts.append("Code of Criminal Procedure, 1973 (CrPC)")
    if "cpc" in q_lower:
        acts.append("Code of Civil Procedure, 1908 (CPC)")
    if "contract" in q_lower:
        acts.append("Indian Contract Act, 1872")
    if "ni act" in q_lower or "cheque" in q_lower:
        acts.append("Negotiable Instruments Act, 1881")
    if "arbitration" in q_lower:
        acts.append("Arbitration and Conciliation Act, 1996")
    if "it act" in q_lower or "cyber" in q_lower:
        acts.append("Information Technology Act, 2000")

    sections = re.findall(r"(?:section|sec\.|article|art\.)\s*(\d+[a-z]*)", q_lower, re.IGNORECASE)
    formatted_sections = [f"Section {s}" if not s.startswith("article") else f"Article {s}" for s in sections]

    # 3. Currentness requirement & Year extraction
    currentness_req = "CURRENT"
    target_year = None
    if any(k in q_lower for k in ["was the law in", "in 2020", "in 2021", "in 2022", "in 2023", "before july 2024", "historical"]):
        currentness_req = "HISTORICAL"
        year_match = re.search(r"\b(20[0-2][0-9]|19[0-9]{2})\b", q)
        if year_match:
            target_year = int(year_match.group(1))
    elif any(k in q_lower for k in ["replaced", "transition", "compared to ipc", "changed after july 1"]):
        currentness_req = "TRANSITIONAL"

    # 4. Resolve Research Depth
    effective_depth = research_depth.upper()
    if user_role in ["JUDGE", "LAWYER"] and research_depth == "STANDARD" and len(q.split()) > 12:
        effective_depth = "DEEP"

    return {
        "domain": domain,
        "jurisdiction": "Republic of India (Supreme Court / High Courts)",
        "primary_issue": q,
        "relevant_acts": acts,
        "relevant_sections": formatted_sections,
        "procedural_issue": "Procedural compliance and statutory safeguards" if "procedure" in domain.lower() else None,
        "factual_issue": "Factual analysis under applicable statutory rules",
        "precedent_required": True,
        "currentness_requirement": currentness_req,
        "target_year": target_year,
        "research_depth": effective_depth
    }
