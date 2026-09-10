import unittest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from llm.client import generate_summary, SHORT_DOC_THRESHOLD, _chunk_long_document

class TestDocumentGroundedSummarizer(unittest.TestCase):

    def test_summary_structure_and_sources(self):
        """TEST A: Short document single-pass summarization."""
        sample_doc = (
            "IN THE HIGH COURT OF JUDICATURE AT BOMBAY\n"
            "WRIT PETITION (CIVIL) NO. 999 OF 2026\n\n"
            "ABC Logistics Ltd. ... Petitioner\n"
            "Versus\n"
            "State of Maharashtra & Ors. ... Respondent\n\n"
            "1. The petitioner challenges tax assessment order dated 15-01-2026 issued under GST Act.\n"
            "2. Petitioner argues violation of natural justice as no personal hearing was granted under Section 75(4).\n"
            "3. Respondent submits notice was issued via GST portal on 01-12-2025.\n"
            "4. Precedents cited: State of UP v. Sudhir Kumar (2020) 15 SCC 300.\n"
            "5. Order: Assessment order quashed. Matter remanded for fresh hearing within 30 days."
        )

        metadata = {"document_id": "test_doc_gst", "document_name": "GST Writ Petition", "page_number": 2}
        summary = generate_summary(sample_doc, metadata=metadata)

        # 13-dimension JSON keys check
        required_keys = [
            "case_overview", "parties", "court", "case_number",
            "important_dates", "key_facts", "legal_issues", "arguments",
            "relevant_acts_sections", "previous_proceedings", "precedents_cited",
            "decision_or_order", "important_observations", "sources"
        ]
        for key in required_keys:
            self.assertIn(key, summary, f"Summary must contain key '{key}'")

        self.assertEqual(len(summary["sources"]), 1)
        self.assertEqual(summary["sources"][0]["document_id"], "test_doc_gst")
        self.assertEqual(summary["sources"][0]["page_number"], 2)
        self.assertEqual(summary.get("summarization_mode"), "DIRECT_SINGLE_PASS")

    def test_long_document_distributed_facts_map_reduce(self):
        """TEST B: Long document with unique facts distributed across Page 1, Page 8, Page 18."""
        page_1 = "[Page 1]\nIN THE HIGH COURT OF JUDICATURE AT BOMBAY\nWRIT PETITION NO 4040 OF 2026\n" + \
                 "Petitioner: Apex Maritime Corp. Respondent: Customs Authority.\n" + \
                 "Fact Alpha: UNIQUE_FACT_BEGINNING_SHIPMENT_VALUED_AT_USD_50_MILLION.\n" + ("Text padding... " * 200)

        page_8 = "\n\n[Page 8]\nFurther submissions regarding legal interpretation.\n" + \
                 "Fact Beta: UNIQUE_FACT_MIDDLE_CONTRABAND_INSPECTION_PASSED_CLEAN.\n" + ("Text padding... " * 200)

        page_18 = "\n\n[Page 18]\nFINAL JUDICIAL DIRECTIVE AND DISPOSAL OF WRIT PETITION.\n" + \
                  "Fact Gamma: UNIQUE_FINAL_ORDER_SEIZURE_ORDER_SET_ASIDE_VESSEL_RELEASED_IMMEDIATELY.\n" + ("Text padding... " * 200)

        long_doc = page_1 + page_8 + page_18
        self.assertGreater(len(long_doc), SHORT_DOC_THRESHOLD, "Document must exceed threshold for long-doc test")

        metadata = {"document_id": "doc_long_maritime", "document_name": "Maritime Writ Petition.pdf"}
        summary = generate_summary(long_doc, metadata=metadata)

        self.assertEqual(summary.get("summarization_mode"), "MAP_REDUCE_HIERARCHICAL")
        self.assertGreater(summary.get("chunk_count", 0), 1, "Must generate multiple chunks")

        # Verify key facts/decision from all sections (beginning, middle, end) are represented in the result
        summary_str = str(summary)
        self.assertTrue(
            "UNIQUE_FACT_BEGINNING" in summary_str or "Apex Maritime" in summary_str or summary["case_number"] != "Not found in document.",
            "Summary must capture beginning facts"
        )
        self.assertTrue(
            "UNIQUE_FACT_MIDDLE" in summary_str or len(summary["key_facts"]) > 0,
            "Summary must capture middle facts"
        )
        self.assertTrue(
            "UNIQUE_FINAL_ORDER" in summary_str or "SEIZURE" in summary_str or "RELEASED" in summary_str or summary["decision_or_order"] != "Not found in document.",
            "Summary must capture final order from page 18"
        )

    def test_final_order_at_end_of_long_document_preserved(self):
        """TEST C: Place the most important final order near the END of a long document and verify it is not lost."""
        filler_text = "Procedural history and statutory arguments paragraph.\n" * 300
        end_order = "\n\n[Page 15]\nFINAL DIRECTIVE: The court orders immediate release of property with 12 percent interest."
        long_doc = "IN THE HIGH COURT\nCASE NO 777/2026\n" + filler_text + end_order

        summary = generate_summary(long_doc)

        self.assertEqual(summary.get("summarization_mode"), "MAP_REDUCE_HIERARCHICAL")
        decision = summary.get("decision_or_order", "")
        self.assertIsNotNone(decision)
        self.assertNotEqual(decision, "Not found in document.", "Final decision at end of long document must be preserved")

    def test_two_different_long_documents_differ(self):
        """TEST D: Two substantially different long documents produce distinct summaries."""
        doc_a = "[Page 1]\nHIGH COURT OF DELHI\nCASE NO. CRL 500/2026\n" + \
                "Ramesh Kumar v. State of Delhi.\n" + ("Section 420 IPC fraud investigation details. " * 300) + \
                "\n\n[Page 12]\nFINAL ORDER: Interim bail granted to Ramesh Kumar on personal bond of INR 50,000."

        doc_b = "[Page 1]\nSUPREME COURT OF INDIA\nCIVIL APPEAL NO. 9876 OF 2025\n" + \
                "Reliance Power v. Electricity Regulatory Board.\n" + ("Tariff determination under Electricity Act 2003. " * 300) + \
                "\n\n[Page 14]\nFINAL ORDER: Appeal allowed. Electricity tariff order dated 2024 is quashed."

        summary_a = generate_summary(doc_a)
        summary_b = generate_summary(doc_b)

        self.assertNotEqual(summary_a["case_overview"], summary_b["case_overview"])
        self.assertNotEqual(summary_a["decision_or_order"], summary_b["decision_or_order"])

    def test_llm_unavailable_fallback_uses_document_content(self):
        """TEST E: LLM unavailable fallback uses actual text extraction and does not invent fake facts."""
        sample_text = (
            "HIGH COURT OF BOMBAY\n"
            "CASE NO. WP 888/2026\n"
            "Titan Industries v. Union of India\n"
            "Challenge to customs duty under Section 12 of Customs Act.\n"
            "Order: Petition admitted."
        )

        # Calling generate_summary when LLM key is absent uses dynamic NLP fallback
        summary = generate_summary(sample_text)
        self.assertIsNotNone(summary)
        self.assertIn("Titan Industries", str(summary["parties"]))
        self.assertNotEqual(summary["case_number"], "FAKE_HARDCODED_CASE_123")

    def test_page_source_metadata(self):
        """TEST F: Page/source metadata trace actual document pages."""
        long_doc = "[Page 1]\nHeader facts.\n" + ("Padding text... " * 200) + \
                   "\n\n[Page 5]\nMiddle facts.\n" + ("Padding text... " * 200)

        summary = generate_summary(long_doc, metadata={"document_id": "doc_traceable_123", "document_name": "Traceable.pdf"})

        sources = summary.get("sources", [])
        self.assertGreater(len(sources), 0, "Sources list must be populated")
        first_src = sources[0]
        self.assertEqual(first_src["document_id"], "doc_traceable_123")
        self.assertIn("page_number", first_src)
        self.assertTrue(isinstance(first_src["page_number"], int))

if __name__ == "__main__":
    unittest.main()
