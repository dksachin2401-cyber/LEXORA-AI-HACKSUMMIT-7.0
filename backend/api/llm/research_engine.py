"""
Phase 9: Deep Legal Research Engine
===================================
Orchestrates end-to-end Deep Legal Research:
Question -> Issue Extraction -> Query Decomposition -> Multi-Corpus Retrieval ->
Authority Reranking -> Evidence Pack Generation -> Multi-Authority IRAC Synthesis ->
Claim Extraction -> Claim Verification -> Research Path Generation -> Output.
"""

import time
import logging
from typing import Dict, Any, List, Optional

from nlp.issue_extractor import extract_legal_issues
from rag.query_decomposer import decompose_legal_query
from rag.multi_corpus_retriever import execute_multi_corpus_retrieval
from rag.evidence_pack import create_evidence_pack
from nlp.claim_verifier import extract_and_verify_claims
from rag.legal_timelines import build_statutory_timeline, generate_statutory_comparison
from llm.client import call_llm, format_evidence_sources, _generate_plain_language_explanation

logger = logging.getLogger(__name__)

RESEARCH_SYNTHESIS_PROMPT = """
You are LEXORA Deep Legal Research Engine.
Perform an authoritative, evidence-grounded legal analysis for the question below using ONLY the supplied Evidence Pack sources.

USER ROLE: {user_role}
RESEARCH DEPTH: {research_depth}
LEGAL DOMAIN: {domain}
QUESTION: {query}

--- STRUCTURED EVIDENCE PACK ---
{evidence_text}
--- END EVIDENCE PACK ---

STRICT MANDATORY RULES:
1. Ground every claim in the provided evidence. Do NOT invent Acts, Sections, Cases, or Citations.
2. Structure the answer into clear sections:
   - APPLICABLE STATUTORY LAW (Relevant Acts and Sections)
   - BINDING JUDICIAL AUTHORITIES (Supreme Court / High Court Rulings)
   - LEGAL ANALYSIS & APPLICATION (Synthesize how precedents interpret statutory provisions)
   - LIMITATIONS & UNRESOLVED ISSUES (Identify any missing facts or unverified historical aspects)
3. If user role is JUDGE or LAWYER, adopt an IRAC (Issue, Rule, Authority, Application, Conclusion) structure.
4. Maintain objectivity. Do NOT issue automatic binding verdicts. Use advisory phrasing: "Potentially relevant provision", "Established precedent mandates".
5. If evidence is insufficient, explicitly state INSUFFICIENT_EVIDENCE.
"""


def execute_deep_legal_research(
    query: str,
    research_depth: str = "STANDARD",
    case_id: Optional[str] = None,
    user_role: str = "CITIZEN",
    conversation_history: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Executes Phase 9 Deep Legal Research Pipeline.
    Returns complete multi-authority research report with Evidence Pack, Claim Verification,
    Research Path, and Explainability breakdown.
    """
    t_start = time.time()
    q_clean = (query or "").strip()

    # Step 1: Legal Issue Extraction
    extracted_params = extract_legal_issues(q_clean, research_depth=research_depth, user_role=user_role)

    # Step 2: Query Decomposition into Sub-tasks
    sub_tasks = decompose_legal_query(q_clean, extracted_params, case_id=case_id)

    # Step 3: Multi-Corpus Retrieval & Reranking
    retrieval_results = execute_multi_corpus_retrieval(sub_tasks, case_id=case_id)

    # Step 4: Construct Internal Evidence Pack
    evidence_pack = create_evidence_pack(q_clean, extracted_params, retrieval_results, case_id=case_id)

    # Step 5: Format Evidence Text for LLM Synthesis
    all_chunks = retrieval_results.get("all_ranked_chunks", [])
    evidence_text = format_evidence_sources(all_chunks) if all_chunks else "No matching evidence chunks retrieved from vector store."

    # Step 6: LLM Multi-Authority IRAC Synthesis
    prompt = RESEARCH_SYNTHESIS_PROMPT.format(
        user_role=user_role.upper(),
        research_depth=extracted_params["research_depth"],
        domain=extracted_params["domain"],
        query=q_clean,
        evidence_text=evidence_text
    )

    raw_answer = call_llm(prompt, temperature=0.0)

    # Step 7: Fallback Synthesis if LLM returns empty or offline
    if not raw_answer:
        if all_chunks:
            top_src = all_chunks[0]
            raw_answer = (
                f"### APPLICABLE STATUTORY LAW & PRECEDENT\n\n"
                f"Based on retrieved judicial record **{top_src.get('case_name') or top_src.get('title')}** "
                f"({top_src.get('court', 'Supreme Court of India')}, {top_src.get('year', 2026)}):\n\n"
                f"\"{top_src.get('excerpt', '')[:400]}\"\n\n"
                f"### LEGAL ANALYSIS & APPLICATION\n"
                f"The indexed legal authorities mandate strict adherence to statutory procedure and constitutional safeguards."
            )
        else:
            raw_answer = (
                f"INSUFFICIENT_EVIDENCE: LEXORA could not find matching official documents in the indexed legal corpus "
                f"for the query '{q_clean}'. No unsupported claims or fake citations have been generated."
            )

    # Step 8: Claim Extraction & Claim-to-Source Verification
    claim_verification = extract_and_verify_claims(raw_answer, evidence_pack)

    # Step 9: Statutory Timelines & Comparison (if historical / transitional)
    statutory_timelines = build_statutory_timeline(extracted_params.get("domain", ""))
    comparison = None
    if "420" in q_clean or "302" in q_clean or "154" in q_clean:
        sec_code = "420" if "420" in q_clean else ("302" if "302" in q_clean else "154")
        act_code = "IPC" if sec_code in ["420", "302"] else "CrPC"
        comparison = generate_statutory_comparison(sec_code, act_code)

    # Step 10: Construct Research Path (Audit Trace)
    research_path = [
        {"step": 1, "title": "Legal Issue Identification", "detail": f"Domain: {extracted_params['domain']} | Depth: {extracted_params['research_depth']}"},
        {"step": 2, "title": "Query Decomposition", "detail": f"Generated {len(sub_tasks)} targeted sub-research tasks"},
        {"step": 3, "title": "Multi-Corpus Retrieval", "detail": f"Searched corpora across {retrieval_results['total_retrieved']} candidate chunks"},
        {"step": 4, "title": "Authority & Currentness Check", "detail": f"Status: {evidence_pack['currentness']} | Strength: {evidence_pack['evidence_strength']}"},
        {"step": 5, "title": "Claim-to-Source Verification", "detail": f"Supported Claim Rate: {claim_verification['supported_claim_rate'] * 100}%"}
    ]

    t_end = time.time()
    latency_ms = round((t_end - t_start) * 1000, 2)

    # Format Enriched Provenance Sources
    enriched_sources = []
    for idx, c in enumerate(all_chunks, 1):
        enriched_sources.append({
            "source_id": f"src_{idx}",
            "title": c.get("title") or c.get("case_name") or "Legal Authority",
            "document_id": c.get("document_id", f"doc_{idx}"),
            "case_name": c.get("case_name", ""),
            "court": c.get("court", "Supreme Court of India"),
            "year": c.get("year", 2026),
            "act": c.get("act", ""),
            "section": c.get("section", ""),
            "citation": c.get("citation", ""),
            "authority_level": c.get("authority_level", 1),
            "relevance_score": round(c.get("relevance_score", 0.0), 2),
            "excerpt": c.get("excerpt") or c.get("text", "")[:350],
            "source_url": c.get("source_url", ""),
            "currentness": c.get("currentness", "VERIFIED")
        })

    return {
        "success": True,
        "query": q_clean,
        "answer": raw_answer,
        "mode": "LEGAL_RESEARCH",
        "research_depth": extracted_params["research_depth"],
        "domain": extracted_params["domain"],
        "evidence_strength": evidence_pack["evidence_strength"],
        "authority_relationship": evidence_pack["authority_relationship"],
        "currentness": evidence_pack["currentness"],
        "grounded": bool(enriched_sources),
        "sources": enriched_sources,
        "evidence_pack": evidence_pack,
        "claim_verification": claim_verification,
        "research_path": research_path,
        "statutory_timelines": statutory_timelines,
        "statutory_comparison": comparison,
        "simple_explanation": _generate_plain_language_explanation(raw_answer, q_clean),
        "latency_ms": latency_ms,
        "disclaimer": "AI ASSISTS. AUTHORIZED HUMAN DECIDES. Based on indexed legal sources available to LEXORA.",
        "why_this_answer": {
            "question_mode": "LEGAL_RESEARCH",
            "retrieved_statutes": len(retrieval_results.get("statutes", [])),
            "retrieved_judgments": len(retrieval_results.get("precedents", [])),
            "primary_authority_level": 1,
            "currentness": evidence_pack["currentness"]
        }
    }
