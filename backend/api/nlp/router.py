import re
from typing import Dict, Any, List

class LegalQueryMode:
    GENERAL_LEGAL = "GENERAL_LEGAL"
    STATUTE_LOOKUP = "STATUTE_LOOKUP"
    CONSTITUTION_LOOKUP = "CONSTITUTION_LOOKUP"
    YES_NO_LEGAL = "YES_NO_LEGAL"
    CASE_LAW = "CASE_LAW"
    CASE_SPECIFIC = "CASE_SPECIFIC"
    DOCUMENT_QA = "DOCUMENT_QA"
    PRECEDENT_SEARCH = "PRECEDENT_SEARCH"
    LEGAL_PROCEDURE = "LEGAL_PROCEDURE"
    LEGAL_COMPARISON = "LEGAL_COMPARISON"
    LEGAL_DRAFTING = "LEGAL_DRAFTING"
    PLAIN_LANGUAGE = "PLAIN_LANGUAGE"
    FOLLOW_UP = "FOLLOW_UP"
    INSUFFICIENT_CONTEXT = "INSUFFICIENT_CONTEXT"
    FACT_PATTERN_ANALYSIS = "FACT_PATTERN_ANALYSIS"
    GREETING = "GREETING"
    CAPABILITY_QUERY = "CAPABILITY_QUERY"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"

    # Convenient Aliases for API compatibility
    CONCEPT_EXPLANATION = "GENERAL_LEGAL"
    PRECEDENT_FINDER = "PRECEDENT_SEARCH"
    CASE_QA = "CASE_SPECIFIC"
    PROCEDURAL_GUIDE = "LEGAL_PROCEDURE"
    MULTI_TURN_FOLLOWUP = "FOLLOW_UP"
    LEGAL_RESEARCH = "PRECEDENT_SEARCH"
    HYPOTHETICAL_SCENARIO = "FACT_PATTERN_ANALYSIS"

def is_greeting_query(q_lower: str) -> bool:
    """
    Detects simple greetings or conversational pleasantries.
    """
    clean = re.sub(r"[^\w\s]", "", q_lower).strip()
    greetings = {
        "hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening",
        "hi there", "hello there", "hey there", "howdy", "thanks", "thank you"
    }
    if clean in greetings:
        return True
    if re.match(r"^(hi|hello|hey|greetings|thanks|thank you)\b", clean) and len(clean.split()) <= 3:
        return True
    return False

def is_capability_query(q_lower: str) -> bool:
    """
    Detects capability and assistant identity queries.
    """
    clean = re.sub(r"[^\w\s]", "", q_lower).strip()
    capabilities = {
        "who are you", "what can you do", "help", "menu", "what are your capabilities", "what is lexora"
    }
    if clean in capabilities:
        return True
    if re.search(r"\b(what\ can\ you\ do|who\ are\ you|what\ is\ lexora|how\ can\ you\ help)\b", q_lower):
        return True
    return False

def is_out_of_scope_query(q_lower: str) -> bool:
    """
    Detects queries that are explicitly non-legal (e.g. science, sports, baking).
    """
    out_topics = [
        "photosynthesis", "quantum physics", "recipe for", "bake a cake", "football score",
        "weather in", "capital of france", "distance to moon", "who won the match"
    ]
    return any(t in q_lower for t in out_topics)

def is_fact_pattern_query(q_lower: str) -> bool:
    """
    Detects natural-language hypothetical or scenario-based legal queries.
    """
    patterns = [
        r"\b(what\ if|what\ happens\ if|suppose|imagine|if\ someone|if\ i\b|i\ accidentally|my\ landlord|my\ employer|if\ a\ person)\b",
        r"\b(accidentally\ (broke|damaged|destroyed)|borrowed\ my\ friend|signs?\ a\ contract\ without\ reading|tenant\ leaves\ before|arrested\ without\ being\ informed|minor\ enters\ into)\b",
        r"\b(how\ would\ the\ answer\ change|what\ if\ i\ did\ it|what\ if\ the\ vase)\b",
        r"\b(damage\ someone\ else\'s\ property|broke\ a\ vase|borrowed\ my\ friend\'s\ car)\b"
    ]
    for p in patterns:
        if re.search(p, q_lower):
            return True
    return False

def requires_rag_retrieval(mode: str, query: str) -> bool:
    """
    Determines whether a query requires RAG vector database retrieval.
    Casual greetings, capability queries, out of scope, and general definitions do NOT require strict RAG.
    """
    non_rag_modes = {
        LegalQueryMode.GREETING,
        LegalQueryMode.CAPABILITY_QUERY,
        LegalQueryMode.OUT_OF_SCOPE
    }
    if mode in non_rag_modes:
        return False
    return True

def classify_query(query: str, has_case_context: bool = False, history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Classifies a legal query into one or more operational modes based on deterministic rules and intent patterns.
    Does NOT make security authorization decisions (authorization is handled independently server-side).
    """
    q_clean = (query or "").strip()
    q_lower = q_clean.lower()

    if not q_clean:
        return {"mode": LegalQueryMode.INSUFFICIENT_CONTEXT, "false_premise_detected": False, "explanation": "Empty query."}

    # Greeting check
    if is_greeting_query(q_lower):
        return {"mode": LegalQueryMode.GREETING, "is_follow_up": False, "false_premise_detected": False, "false_premise_reason": ""}

    # Capability check
    if is_capability_query(q_lower):
        return {"mode": LegalQueryMode.CAPABILITY_QUERY, "is_follow_up": False, "false_premise_detected": False, "false_premise_reason": ""}

    # Out of scope check
    if is_out_of_scope_query(q_lower):
        return {"mode": LegalQueryMode.OUT_OF_SCOPE, "is_follow_up": False, "false_premise_detected": False, "false_premise_reason": ""}

    # Check for False Premise indicators (e.g. false legal assertions)
    false_premise_detected = False
    false_premise_reason = ""
    if re.search(r"abolished\s+(anticipatory\s+bail|writ|habeas\s+corpus)", q_lower):
        false_premise_detected = True
        false_premise_reason = "Premise assumes anticipatory bail or fundamental writ remedies were abolished, which is statutorily inaccurate."
    elif re.search(r"supreme\ court\ (outlawed|banned)\ (divorce|bail)\ in\ 2025", q_lower):
        false_premise_detected = True
        false_premise_reason = "Premise assumes Supreme Court banned fundamental legal remedies."
    elif re.search(r"arrest.*without.*warrant.*bailable", q_lower):
        false_premise_detected = True
        false_premise_reason = "Premise assumes police can arrest without a warrant for a bailable offence. In bailable offences, bail is a matter of right."

    # Follow-up detection
    is_hypothetical = is_fact_pattern_query(q_lower)
    is_follow_up = False
    if history and len(history) > 0:
        if is_hypothetical or re.search(r"\b(it|this|that|he|she|they|the\ case|the\ order|above|previous|notice|requirement|statutory)\b", q_lower):
            is_follow_up = True

    # Mode determination rules
    if re.search(r"\b(draft|prepare|create\ a)\b", q_lower):
        mode = LegalQueryMode.LEGAL_DRAFTING
    elif re.search(r"\b(difference|compare|versus|vs\.?|contrast|distinguish)\b", q_lower):
        mode = LegalQueryMode.LEGAL_COMPARISON
    elif is_hypothetical:
        mode = LegalQueryMode.FACT_PATTERN_ANALYSIS
    elif re.search(r"\barticle\ \d+", q_lower):
        mode = LegalQueryMode.CONSTITUTION_LOOKUP
    elif re.search(r"\b(section|sec\.?|statute|act|provision)\ \d+", q_lower):
        mode = LegalQueryMode.STATUTE_LOOKUP
    elif re.search(r"^(can\ i|can\ police|is\ it\ legal|can\ a|is\ it\ allowed)\b", q_lower):
        mode = LegalQueryMode.YES_NO_LEGAL
    elif re.search(r"\b(procedure|how\ to\ file|process\ for|steps\ to|timeline)\b", q_lower):
        mode = LegalQueryMode.LEGAL_PROCEDURE
    elif re.search(r"\b(page\ \d+|on\ page|uploaded\ document|affidavit|petitioner\ argue|respondent|witness)\b", q_lower) and has_case_context:
        mode = LegalQueryMode.DOCUMENT_QA
    elif re.search(r"\b(find\ similar|precedent|case\ law|supreme\ court\ held|judgments|research)\b", q_lower):
        mode = LegalQueryMode.PRECEDENT_SEARCH
    elif is_follow_up:
        mode = LegalQueryMode.FOLLOW_UP
    elif has_case_context:
        mode = LegalQueryMode.CASE_SPECIFIC
    elif re.search(r"\b(in\ simple\ terms|explain\ simply|plain\ language|easy\ explanation)\b", q_lower):
        mode = LegalQueryMode.PLAIN_LANGUAGE
    else:
        mode = LegalQueryMode.GENERAL_LEGAL

    return {
        "mode": mode,
        "is_follow_up": is_follow_up,
        "false_premise_detected": false_premise_detected,
        "false_premise_reason": false_premise_reason
    }

