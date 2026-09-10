import unittest
from nlp.router import classify_query, LegalQueryMode, requires_rag_retrieval
from llm.client import unified_legal_chat

class TestUniversalChatbotRouting(unittest.TestCase):

    def test_01_casual_greeting_no_rag(self):
        query = "hi"
        classified = classify_query(query)
        self.assertEqual(classified["mode"], LegalQueryMode.GREETING)
        self.assertFalse(requires_rag_retrieval(classified["mode"], query))

        res = unified_legal_chat(query)
        self.assertEqual(res["mode"], LegalQueryMode.GREETING)
        self.assertIn("Hello!", res["answer"])
        self.assertNotIn("INSUFFICIENT", res["answer"].upper())
        self.assertEqual(len(res["sources"]), 0)

    def test_02_capability_query_no_rag(self):
        query = "what can you do"
        classified = classify_query(query)
        self.assertEqual(classified["mode"], LegalQueryMode.CAPABILITY_QUERY)
        self.assertFalse(requires_rag_retrieval(classified["mode"], query))

        res = unified_legal_chat(query)
        self.assertEqual(res["mode"], LegalQueryMode.CAPABILITY_QUERY)
        self.assertIn("explain Indian law", res["answer"])
        self.assertNotIn("INSUFFICIENT", res["answer"].upper())

    def test_03_general_information_court(self):
        query = "what is court"
        res = unified_legal_chat(query)
        self.assertIn("legal institution", res["answer"].lower())
        self.assertNotIn("INSUFFICIENT AUTHORITATIVE EVIDENCE", res["answer"].upper())

    def test_04_general_information_bail(self):
        query = "what is bail"
        res = unified_legal_chat(query)
        self.assertIn("temporary release", res["answer"].lower())
        self.assertNotIn("INSUFFICIENT AUTHORITATIVE EVIDENCE", res["answer"].upper())

    def test_05_yes_no_driving_licence(self):
        query = "Can I drive without a licence?"
        res = unified_legal_chat(query)
        self.assertTrue(res["answer"].lower().startswith("generally, no") or "no." in res["answer"].lower()[:30])
        self.assertIn("Motor Vehicles Act", res["answer"])

    def test_06_fact_pattern_vase(self):
        query = "What if I broke the vase in a palace??"
        res = unified_legal_chat(query)
        self.assertEqual(res["mode"], LegalQueryMode.FACT_PATTERN_ANALYSIS)
        self.assertIn("accidental", res["answer"].lower())
        self.assertNotIn("FACTS IDENTIFIED", res["answer"])
        self.assertNotIn("POTENTIAL LEGAL ISSUES", res["answer"])

    def test_07_followup_intentional(self):
        history = [
            {"sender": "user", "text": "What if I broke the vase in a palace??"},
            {"sender": "assistant", "text": "If you accidentally broke a vase..."}
        ]
        followup = "What if it was intentional?"
        res = unified_legal_chat(followup, conversation_history=history)
        self.assertIn("intentional", res["answer"].lower())
        self.assertNotIn("FACTS IDENTIFIED", res["answer"])

    def test_08_out_of_scope_query(self):
        query = "what is the capital of France?"
        res = unified_legal_chat(query)
        self.assertEqual(res["mode"], LegalQueryMode.OUT_OF_SCOPE)
        self.assertIn("outside", res["answer"].lower())

    def test_09_grounding_protection_nonexistent_statute(self):
        query = "What is Section 99999 of the Nonexistent Property Act?"
        res = unified_legal_chat(query)
        self.assertFalse(res["grounded"])
        self.assertIn("INSUFFICIENT_AUTHORITATIVE_EVIDENCE", res["answer"])

if __name__ == "__main__":
    unittest.main()
