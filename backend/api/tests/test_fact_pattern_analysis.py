"""
Test Suite for Fact-Pattern & Hypothetical Legal Question Support
===================================================================
Tests natural-language hypothetical query classification, structured fact extraction,
query expansion, RAG retrieval grounding, multi-turn follow-ups, and negative grounding protection.
"""

import os
import sys
import unittest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from nlp.router import classify_query, LegalQueryMode, is_fact_pattern_query
from nlp.fact_extractor import extract_fact_pattern
from rag.query_expansion import expand_legal_query
from llm.client import unified_legal_chat


class TestFactPatternAnalysis(unittest.TestCase):

    def test_01_classification_museum_vase(self):
        query = "What if I accidentally broke a vase in a museum?"
        res = classify_query(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_02_classification_property_damage(self):
        query = "What happens if I damage someone else's property accidentally?"
        res = classify_query(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_03_classification_borrowed_car(self):
        query = "I borrowed my friend's car and accidentally damaged it. What legal issues could arise?"
        res = classify_query(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_04_classification_unread_contract(self):
        query = "What if someone signs a contract without reading it?"
        res = classify_query(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_05_classification_tenant_lease(self):
        query = "What happens if a tenant leaves before the lease expires?"
        res = classify_query(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_06_classification_minor_contract(self):
        query = "What if a minor enters into a contract?"
        res = classify_query(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_07_structured_fact_extraction(self):
        query = "What if I accidentally broke a vase in a museum?"
        facts = extract_fact_pattern(query)
        self.assertIn("User", facts["actor"])
        self.assertIn("Accidental", facts["intent"])
        self.assertIn("Vase", facts["object"])
        self.assertIn("Museum", facts["location"])

    def test_08_query_expansion_hypothetical(self):
        query = "What if I accidentally broke a vase in a museum?"
        expansions = expand_legal_query(query)
        self.assertGreaterEqual(len(expansions), 2)
        combined = " ".join(expansions).lower()
        self.assertTrue("mischief" in combined or "damage" in combined or "negligence" in combined)

    def test_09_end_to_end_grounded_response_vase(self):
        query = "What if I accidentally broke a vase in a museum?"
        res = unified_legal_chat(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_10_end_to_end_grounded_response_tenant(self):
        query = "What happens if a tenant leaves before the lease expires?"
        res = unified_legal_chat(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_11_multi_turn_hypothetical_followup(self):
        history = [
            {"sender": "user", "text": "What if I accidentally broke a vase in a museum?"},
            {"sender": "assistant", "text": "Under Indian law, accidental damage to property attracts civil compensation for negligence..."}
        ]
        followup_query = "How would the answer change if the damage was accidental rather than intentional?"
        res = unified_legal_chat(followup_query, conversation_history=history)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)

    def test_12_negative_test_nonexistent_statute(self):
        query = "What if I broke an imaginary object under Section 99999 of the Nonexistent Property Act?"
        res = unified_legal_chat(query)
        self.assertFalse(res["grounded"])
        self.assertIn("INSUFFICIENT", res["answer"].upper())
        self.assertEqual(res["evidence_status"], "INSUFFICIENT_EVIDENCE")

    def test_13_greeting_query(self):
        query = "hi"
        res = unified_legal_chat(query)
        self.assertEqual(res["mode"], LegalQueryMode.GREETING)
        self.assertIn("Hello! I am LEXORA", res["answer"])
        self.assertEqual(len(res["sources"]), 0)

    def test_14_out_of_scope_query(self):
        query = "What is photosynthesis?"
        res = unified_legal_chat(query)
        self.assertEqual(res["mode"], LegalQueryMode.OUT_OF_SCOPE)
        self.assertIn("outside LEXORA's legal research scope", res["answer"])
        self.assertEqual(len(res["sources"]), 0)


if __name__ == "__main__":
    unittest.main()
