"""
Regression Test Suite for Question-First Architecture & Primary Authority Ranking
===================================================================================
Tests that natural language legal questions:
1. Return direct, question-first conclusions ("No. You cannot legally drive...")
2. Prioritize primary statutory provisions (Section 3 & Section 181 Motor Vehicles Act) over secondary insurance cases
3. Filter out semantically similar but non-answering precedents
4. Maintain grounded citation verification and multi-turn context
"""

import os
import sys
import unittest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from nlp.router import classify_query, LegalQueryMode
from rag.query_expansion import expand_legal_query, rank_and_deduplicate_chunks
from llm.client import unified_legal_chat


class TestQuestionFirstPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        from seed_data.seed_authoritative_corpus import run_authoritative_ingestion
        run_authoritative_ingestion()

    def test_01_driving_licence_direct_answer(self):
        query = "Can I drive without driving license?"
        res = unified_legal_chat(query)
        answer = res["answer"]

        # 1. Must contain direct conclusion
        self.assertTrue(
            "No" in answer or "cannot" in answer.lower(),
            "Answer must begin with a clear, direct conclusion."
        )

        # 2. Must cite primary statutory provisions (Section 3 or Section 181 Motor Vehicles Act)
        self.assertTrue(
            "Motor Vehicles Act" in answer or "Section 3" in answer or "Section 181" in answer,
            "Answer must cite the primary statutory authority."
        )

        # 3. Grounding & Evidence Status
        self.assertTrue(res["grounded"])
        self.assertIn(res["evidence_status"], ["SUPPORTED", "PARTIALLY_SUPPORTED"])

    def test_02_primary_statute_outranks_insurance_precedent(self):
        query = "Can I drive without driving license?"
        raw_chunks = [
            {
                "chunk_id": "insurance_case",
                "act": "Supreme Court Precedent",
                "case_name": "National Insurance Co. Ltd. v. Swaran Singh",
                "excerpt": "Third party insurance liability of insurer when driver lacks valid driving licence under Section 149.",
                "authority_level": 2,
                "score": 0.85
            },
            {
                "chunk_id": "statute_sec_3",
                "act": "Motor Vehicles Act, 1988",
                "section": "3",
                "excerpt": "Section 3. Necessity for driving licence. No person shall drive a motor vehicle in any public place unless he holds an effective driving licence.",
                "authority_level": 1,
                "score": 0.82
            },
            {
                "chunk_id": "statute_sec_181",
                "act": "Motor Vehicles Act, 1988",
                "section": "181",
                "excerpt": "Section 181. Driving vehicles in contravention of section 3 or section 4. Whoever drives a motor vehicle in contravention of section 3 shall be punishable with imprisonment.",
                "authority_level": 1,
                "score": 0.80
            }
        ]

        ranked = rank_and_deduplicate_chunks(raw_chunks, top_k=3, query=query)
        top_chunk = ranked[0]

        # Primary statute (Section 3 or Section 181) MUST outrank insurance case
        self.assertIn("Motor Vehicles Act", top_chunk.get("act", ""))
        self.assertIn(top_chunk.get("section", ""), ["3", "181"])

    def test_03_learner_licence_followup(self):
        history = [
            {"sender": "user", "text": "Can I drive without driving license?"},
            {"sender": "assistant", "text": "No. Under Indian law, driving without an effective driving licence is prohibited under Section 3 of the Motor Vehicles Act..."}
        ]
        query = "What if I have a learner licence?"
        res = unified_legal_chat(query, conversation_history=history)

        answer = res["answer"]
        self.assertTrue(res["grounded"])
        self.assertTrue(
            "learner" in answer.lower() or "section" in answer.lower() or "motor vehicles" in answer.lower(),
            "Follow-up must understand learner licence context."
        )


if __name__ == "__main__":
    unittest.main()
