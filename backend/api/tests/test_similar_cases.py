import unittest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.ingest import ingest_document
from rag.retrieve import search_similar_documents

class TestSimilarCaseRetrieval(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ingest synthetic precedents with known distinct legal topics
        cls.doc1_text = (
            "IN THE SUPREME COURT OF INDIA\n"
            "CIVIL APPEAL NO. 7001 OF 2024\n"
            "State Bank of India v. Commercial Borrower Ltd.\n"
            "Held: Section 13(2) of SARFAESI Act requires mandatory 60-day demand notice before asset possession."
        )
        cls.doc1_meta = {
            "document_id": "doc_sarfaesi_1",
            "document_name": "SARFAESI Precedent Brief",
            "case_name": "State Bank of India v. Commercial Borrower Ltd.",
            "court": "Supreme Court of India",
            "year": 2024,
            "page_number": 1
        }

        cls.doc2_text = (
            "IN THE HIGH COURT OF DELHI\n"
            "CRIMINAL APPEAL NO. 405 OF 2023\n"
            "Ramesh Sharma v. State\n"
            "Held: Section 138 of Negotiable Instruments Act requires statutory 15-day notice following cheque dishonor."
        )
        cls.doc2_meta = {
            "document_id": "doc_ni_1",
            "document_name": "NI Act Cheque Bounce Judgment",
            "case_name": "Ramesh Sharma v. State",
            "court": "High Court of Delhi",
            "year": 2023,
            "page_number": 3
        }

        ingest_document(cls.doc1_text, cls.doc1_meta)
        ingest_document(cls.doc2_text, cls.doc2_meta)

    def test_semantic_ranking_sarfaesi(self):
        query = "60-day demand notice asset seizure under SARFAESI bank recovery"
        results = search_similar_documents(query, top_k=2)

        self.assertTrue(len(results) > 0)
        top_match = results[0]

        # Verify top match is SARFAESI document
        self.assertIn("SARFAESI", top_match["excerpt"].upper())
        self.assertIn("authority_level", top_match)
        self.assertIn("why_it_is_relevant", top_match)
        self.assertIn("page_number", top_match)

    def test_semantic_ranking_cheque_bounce(self):
        query = "Cheque bounce 15-day notice Section 138 Negotiable Instruments"
        results = search_similar_documents(query, top_k=2)

        self.assertTrue(len(results) > 0)
        top_match = results[0]

        # Verify top match is Cheque bounce document (statute or precedent)
        top_match_info = f"{top_match.get('title', '')} {top_match.get('document_name', '')} {top_match['excerpt']}".upper()
        self.assertIn("NEGOTIABLE INSTRUMENTS", top_match_info)
        self.assertIn(int(top_match["authority_level"]), [1, 2])

    def test_empty_query_returns_empty(self):
        results = search_similar_documents("")
        self.assertEqual(results, [])

    def test_statutory_queries_with_authoritative_corpus(self):
        from seed_data.seed_authoritative_corpus import run_authoritative_ingestion
        run_authoritative_ingestion()

        # 1. Motor Vehicles Act Section 181
        mv_res = search_similar_documents("Motor Vehicles Act, 1988 Section 181 Driving Without Valid License Penalty", top_k=5)
        self.assertTrue(len(mv_res) > 0, "Motor Vehicles Act Section 181 should retrieve evidence")
        mv_titles = [m.get("title", "") or m.get("document_name", "") for m in mv_res]
        self.assertTrue(any("Motor Vehicles Act" in t or "Swaran Singh" in t or "Jagdish" in t for t in mv_titles))

        # 2. Negotiable Instruments Act Section 138
        ni_res = search_similar_documents("Negotiable Instruments Act, 1881 Section 138 Demand notice requirements", top_k=5)
        self.assertTrue(len(ni_res) > 0, "NI Act Section 138 should retrieve evidence")

        # 3. Constitution Article 21
        const_res = search_similar_documents("Constitution of India Article 21 Personal liberty", top_k=5)
        self.assertTrue(len(const_res) > 0, "Article 21 should retrieve evidence")

        # 4. SARFAESI Act Section 13(2)
        sarfaesi_res = search_similar_documents("SARFAESI Act, 2002 Section 13(2) Demand notice", top_k=5)
        self.assertTrue(len(sarfaesi_res) > 0, "SARFAESI Section 13(2) should retrieve evidence")

    def test_unsupported_nonexistent_query_returns_zero_evidence(self):
        from seed_data.seed_authoritative_corpus import run_authoritative_ingestion
        from nlp.verifier import verify_citations
        run_authoritative_ingestion()

        neg_res = search_similar_documents("Some Nonexistent Act Section 99999 Completely nonexistent legal provision", top_k=5)
        self.assertEqual(len(neg_res), 0, "Nonexistent Act Section 99999 must return zero evidence")

        verifier_res = verify_citations("Answer text", neg_res)
        self.assertEqual(verifier_res["evidence_status"], "INSUFFICIENT_EVIDENCE")


    def test_primary_statute_outranks_secondary_brief(self):
        """Verify primary statutory legislation outranks secondary precedent brief/summary when both match a statutory query."""
        primary_text = (
            "Section 13(2): Enforcement of security interest. "
            "Where any borrower, who is under a liability to a secured creditor, makes any default in repayment."
        )
        primary_meta = {
            "document_id": "doc_sarfaesi_statute_primary",
            "document_type": "STATUTE",
            "title": "SARFAESI Act 2002 (Primary Statute)",
            "act": "SARFAESI Act, 2002",
            "section": "Section 13(2)",
            "authority_level": 1,
            "corpus": "GLOBAL_STATUTES"
        }

        secondary_text = (
            "SARFAESI Precedent Brief. Held: Section 13(2) of SARFAESI Act requires mandatory 60-day demand notice."
        )
        secondary_meta = {
            "document_id": "doc_sarfaesi_brief_secondary",
            "document_type": "CASE_DOCUMENT",
            "title": "SARFAESI Precedent Brief",
            "citation": "SARFAESI Precedent Brief",
            "authority_level": 2,
            "corpus": "CASE_SCOPED"
        }

        ingest_document(primary_text, primary_meta)
        ingest_document(secondary_text, secondary_meta)

        results = search_similar_documents("SARFAESI Act, 2002 Section 13(2) Demand notice", top_k=2)
        self.assertGreaterEqual(len(results), 2)
        top_match = results[0]
        self.assertEqual(top_match["authority_level"], 1, "Top match must be primary statute (Level 1)")
        self.assertEqual(top_match["document_type"], "STATUTE", "Top match document type must be STATUTE")
        self.assertGreater(results[0]["relevance_score"], results[1]["relevance_score"], "Primary statute score must outrank secondary brief score")


if __name__ == "__main__":
    unittest.main()
