import unittest
import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.ingest import ingest_document
from rag.retrieve import search_similar_documents
from llm.client import answer_rag_qa, format_evidence_sources

class TestRealGroundedRAGPipeline(unittest.TestCase):

    def setUp(self):
        # Ingest a synthetic, unique legal document containing arbitrary non-public facts
        self.synthetic_doc_id = "test_synthetic_order_9982"
        self.synthetic_text = (
            "IN THE HIGH COURT OF JUDICATURE AT SPECIAL BENCH\n"
            "ORDER IN WRIT PETITION NO. XYZ-9982 OF 2029\n\n"
            "Hon'ble Justice Armitage presiding.\n"
            "The Court hereby holds that under Section 998B of the Special Technology Act 2029, "
            "the mandatory statutory ratio for compliance penalty is strictly 87.4 percent. "
            "Any administrative default exceeding 87.4 percent incurs an immediate compounding fine of INR 1,50,000."
        )
        self.metadata = {
            "document_id": self.synthetic_doc_id,
            "document_name": "Special Technology Compliance Order 2029",
            "case_name": "WP(C) XYZ-9982/2029",
            "court": "High Court Special Bench",
            "year": 2029,
            "page_number": 4
        }
        
        ingest_res = ingest_document(self.synthetic_text, self.metadata)
        self.assertTrue(ingest_res["success"], "Document ingestion must succeed")

    def test_vector_search_returns_metadata_and_relevance(self):
        query = "What is the compliance penalty ratio under Section 998B of Special Technology Act 2029?"
        matches = search_similar_documents(query, top_k=3)
        
        self.assertGreater(len(matches), 0, "Vector search must return matches")
        top_match = matches[0]
        
        # Verify metadata preservation
        self.assertIn("document_id", top_match)
        self.assertIn("document_name", top_match)
        self.assertIn("case_name", top_match)
        self.assertIn("relevance_score", top_match)
        self.assertIn("excerpt", top_match)

    def test_evidence_formatter_builds_source_blocks(self):
        query = "compliance penalty ratio Section 998B"
        matches = search_similar_documents(query, top_k=2)
        formatted = format_evidence_sources(matches)
        
        self.assertIn("[Source 1]", formatted)
        self.assertIn("Case:", formatted)
        self.assertIn("Court:", formatted)
        self.assertIn("Year:", formatted)
        self.assertIn("Document:", formatted)
        self.assertIn("Page:", formatted)
        self.assertIn("Evidence:", formatted)

    def test_rag_qa_injects_context_and_answers_from_evidence_only(self):
        query = "What is the exact penalty ratio and judge name in Case XYZ-9982?"
        matches = search_similar_documents(query, top_k=3)
        
        result = answer_rag_qa(query, matches)
        
        self.assertTrue(result["grounded"], "Response must be flagged as grounded")
        self.assertGreater(len(result["sources"]), 0, "Structured sources must be returned")
        
        answer = result["answer"]
        self.assertTrue(
            "87.4" in answer or "Armitage" in answer or "XYZ-9982" in answer,
            f"LLM answer must contain facts retrieved from the evidence block. Received: {answer}"
        )
        
        # Verify structured sources format
        source_meta = result["sources"][0]
        self.assertIn("document_id", source_meta)
        self.assertIn("case_name", source_meta)
        self.assertIn("relevance_score", source_meta)

    def test_citation_metadata_completeness_and_validation(self):
        """
        Validates that all citation metadata fields (document_id, document_name, case_name,
        court, year, page_number, chunk_id, relevance_score, excerpt) are non-empty and accurate.
        """
        matches = search_similar_documents("compliance penalty ratio Section 998B", top_k=1)
        self.assertGreater(len(matches), 0)
        
        src = matches[0]
        required_keys = ["document_id", "document_name", "case_name", "court", "year", "page_number", "chunk_id", "relevance_score", "excerpt"]
        
        for k in required_keys:
            self.assertIn(k, src, f"Citation metadata must include key '{k}'")
            self.assertIsNotNone(src[k], f"Citation metadata key '{k}' must not be None")
        
        self.assertGreaterEqual(src["relevance_score"], 0.0)
        self.assertLessEqual(src["relevance_score"], 1.0)
        self.assertGreater(len(src["excerpt"].strip()), 0)

    def test_insufficient_evidence_returns_ungrounded(self):
        empty_matches = []
        result = answer_rag_qa("What is the speed of light in vacuum?", empty_matches)
        
        self.assertFalse(result["grounded"], "Response must be ungrounded when evidence is empty")
        self.assertEqual(result["answer"], "Insufficient evidence found in the indexed documents.")
        self.assertEqual(len(result["sources"]), 0)

if __name__ == '__main__':
    unittest.main()
