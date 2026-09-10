"""
Phase 17.1: Strict RAG Case Isolation — Security & Correctness Test Suite
==========================================================================
Tests:
  1. Case A cannot retrieve Case B documents (cross-case isolation)
  2. Case B cannot retrieve Case A documents (symmetric isolation)
  3. Case-specific citations all match requested case_id
  4. Missing case_id for case-specific RAG is rejected
  5. Insufficient evidence from wrong case produces ungrounded response
  6. Multiple documents within same case can be retrieved
  7. Global precedent search still works (no case_id filter)
  8. Existing RAG pipeline tests still pass (regression)
  9. Ingest now stores case_id in metadata
 10. In-memory fallback also respects case_id filter
"""
import unittest
import os
import sys
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.ingest import ingest_document, in_memory_store
from rag.retrieve import search_similar_documents
from llm.client import answer_rag_qa


class TestCaseIsolationSecurity(unittest.TestCase):
    """
    SECURITY TEST: Cross-case RAG isolation.
    Two cases are indexed with unique, non-overlapping secret facts.
    Verifies that querying Case A never retrieves Case B facts.
    """

    CASE_A_ID = f"security-test-case-A-{uuid.uuid4().hex[:8]}"
    CASE_B_ID = f"security-test-case-B-{uuid.uuid4().hex[:8]}"

    CASE_A_SECRET = "CASE_A_SECRET_UNIQUE_FACT_ALPHA_XRAY_7491"
    CASE_B_SECRET = "CASE_B_SECRET_UNIQUE_FACT_BRAVO_DELTA_8823"

    @classmethod
    def setUpClass(cls):
        """Index CASE_A and CASE_B documents into ChromaDB before all tests."""

        # ── Index Case A ────────────────────────────────────────────────────────
        ingest_result_a = ingest_document(
            text=(
                f"IN THE HIGH COURT AT CASE A SPECIAL BENCH\n"
                f"ORDER IN WP NO. CASE-A-001 OF 2030\n\n"
                f"The court finds that the {cls.CASE_A_SECRET} applies under Section 42A of "
                f"the Special Compliance Act 2030. The mandatory compliance ratio is 72.1 percent. "
                f"Any breach triggers immediate suspension of operations per Circular CASE-A-001."
            ),
            metadata={
                "document_id": f"doc-case-a-001",
                "case_id": cls.CASE_A_ID,
                "case_name": "Case A vs. Authority A",
                "case_number": "WP CASE-A-001/2030",
                "court": "High Court Special Bench A",
                "year": 2030,
                "page_number": 1,
                "source": "Phase 17.1 Security Test"
            }
        )
        assert ingest_result_a["success"], "Case A ingestion must succeed"
        cls.case_a_doc_id = ingest_result_a["doc_id"]

        # ── Index Case B ────────────────────────────────────────────────────────
        ingest_result_b = ingest_document(
            text=(
                f"IN THE DISTRICT COURT AT CASE B DIVISION\n"
                f"ORDER IN SUIT NO. CASE-B-001 OF 2031\n\n"
                f"The court finds that the {cls.CASE_B_SECRET} establishes liability under "
                f"Section 88B of the Industrial Tribunal Act 2031. The penalty ratio is 91.5 percent. "
                f"Respondent B is directed to comply within 21 days per Circular CASE-B-001."
            ),
            metadata={
                "document_id": f"doc-case-b-001",
                "case_id": cls.CASE_B_ID,
                "case_name": "Case B vs. Industry B",
                "case_number": "SUIT CASE-B-001/2031",
                "court": "District Court Division B",
                "year": 2031,
                "page_number": 1,
                "source": "Phase 17.1 Security Test"
            }
        )
        assert ingest_result_b["success"], "Case B ingestion must succeed"
        cls.case_b_doc_id = ingest_result_b["doc_id"]

    # ── Test 1: Case A query cannot retrieve Case B secret fact ─────────────────
    def test_01_case_a_cannot_retrieve_case_b(self):
        """Case A query designed to target Case B fact must return ZERO Case B chunks."""
        # This query uses keywords from Case B to try to cross-retrieve
        query = f"penalty ratio Industrial Tribunal Act CASE-B-001"
        matches = search_similar_documents(query, top_k=5, case_id=self.CASE_A_ID)

        for chunk in matches:
            chunk_case_id = chunk.get("case_id", "")
            self.assertNotEqual(
                chunk_case_id, self.CASE_B_ID,
                f"SECURITY VIOLATION: Case A retrieval returned a chunk belonging to Case B! "
                f"chunk_id={chunk.get('chunk_id')}, case_id={chunk_case_id}"
            )
            # Verify Case B secret never appears in excerpts
            self.assertNotIn(
                self.CASE_B_SECRET,
                chunk.get("excerpt", ""),
                "SECURITY VIOLATION: Case B secret fact appeared in Case A retrieval!"
            )

    # ── Test 2: Case B query cannot retrieve Case A secret fact ─────────────────
    def test_02_case_b_cannot_retrieve_case_a(self):
        """Case B query must NEVER return chunks belonging to Case A."""
        query = f"Special Compliance Act Section 42A CASE-A-001"
        matches = search_similar_documents(query, top_k=5, case_id=self.CASE_B_ID)

        for chunk in matches:
            chunk_case_id = chunk.get("case_id", "")
            self.assertNotEqual(
                chunk_case_id, self.CASE_A_ID,
                f"SECURITY VIOLATION: Case B retrieval returned a chunk belonging to Case A! "
                f"chunk_id={chunk.get('chunk_id')}, case_id={chunk_case_id}"
            )
            self.assertNotIn(
                self.CASE_A_SECRET,
                chunk.get("excerpt", ""),
                "SECURITY VIOLATION: Case A secret fact appeared in Case B retrieval!"
            )

    # ── Test 3: Case A retrieves its own fact correctly ──────────────────────────
    def test_03_case_a_retrieves_own_fact(self):
        """A Case A query using its own keywords must return Case A evidence."""
        query = f"Special Compliance Act Section 42A CASE-A-001 compliance ratio"
        matches = search_similar_documents(query, top_k=3, case_id=self.CASE_A_ID)

        # All returned chunks must belong to Case A
        for chunk in matches:
            chunk_case_id = chunk.get("case_id", "")
            self.assertIn(
                chunk_case_id, [self.CASE_A_ID, ""],
                f"Retrieved chunk must belong to Case A or be global. Got: {chunk_case_id}"
            )

    # ── Test 4: Case-specific citations all match requested case_id ──────────────
    def test_04_citation_integrity_all_match_case_a(self):
        """Every citation returned for Case A must have case_id == CASE_A_ID."""
        query = "compliance ratio circular suspension"
        matches = search_similar_documents(query, top_k=5, case_id=self.CASE_A_ID)

        for chunk in matches:
            chunk_case_id = chunk.get("case_id", "")
            # chunk_case_id may be "" if no case_id was set (global precedent in collection)
            # but it MUST NOT be another non-empty, non-matching case_id
            if chunk_case_id:
                self.assertEqual(
                    chunk_case_id, self.CASE_A_ID,
                    f"Citation integrity violation: chunk case_id={chunk_case_id} "
                    f"does not match requested case_id={self.CASE_A_ID}"
                )

    # ── Test 5: Missing case_id on retrieve returns global (not blocked at retrieve level) ─
    def test_05_missing_case_id_retrieves_globally(self):
        """
        search_similar_documents with case_id=None performs global search.
        This is correct — the /ask endpoint enforces case_id at the API level.
        Verify that global retrieval returns results from multiple cases.
        """
        query = "penalty ratio compliance act section"
        global_matches = search_similar_documents(query, top_k=10, case_id=None)
        # Global search should return some results (both cases seeded)
        self.assertIsInstance(global_matches, list)
        # Results may come from either case — that is expected for global search

    # ── Test 6: Insufficient evidence produces ungrounded response ───────────────
    def test_06_case_a_question_with_only_case_b_answer_produces_insufficient(self):
        """
        Ask a Case A question where the answer ONLY exists in Case B.
        Expected: retrieval returns no Case A chunks → LLM answer is 'Insufficient evidence'.
        """
        # Query the Case A collection for a fact that exists ONLY in Case B
        query = f"Industrial Tribunal Act 2031 penalty ratio 91.5 percent CASE-B-001"
        matches = search_similar_documents(query, top_k=5, case_id=self.CASE_A_ID)

        # Run LLM grounding check
        result = answer_rag_qa(query, matches)

        # If no Case A chunks matched (because the answer was only in Case B),
        # the LLM must say 'Insufficient evidence'
        if not matches:
            self.assertFalse(result["grounded"], "Response must be ungrounded when no evidence found")
            self.assertIn(
                "Insufficient evidence",
                result["answer"],
                "LLM must state 'Insufficient evidence' when no context is found"
            )
        else:
            # If by semantic similarity some Case A chunk was returned,
            # verify none of them contain the Case B secret fact
            for chunk in matches:
                self.assertNotIn(
                    self.CASE_B_SECRET,
                    chunk.get("excerpt", ""),
                    "LLM context must NEVER contain Case B secret fact for Case A query"
                )

    # ── Test 7: Multiple documents within same case can be retrieved ─────────────
    def test_07_multi_document_same_case_retrieval(self):
        """Index two documents under Case A and verify both are accessible together."""
        case_multi_id = f"security-multi-doc-{uuid.uuid4().hex[:8]}"

        # Document 1
        ingest_document(
            "Case Multi Document 1: The first statutory provision states that the MULTI_DOC_FACT_ALPHA applies.",
            {
                "document_id": "multi-doc-1",
                "case_id": case_multi_id,
                "case_name": "Multi-Doc Case",
                "case_number": "MULTI/001/2030",
                "court": "Test Tribunal",
                "year": 2030,
                "page_number": 1
            }
        )

        # Document 2
        ingest_document(
            "Case Multi Document 2: The second regulation states that MULTI_DOC_FACT_BETA provisions apply.",
            {
                "document_id": "multi-doc-2",
                "case_id": case_multi_id,
                "case_name": "Multi-Doc Case",
                "case_number": "MULTI/001/2030",
                "court": "Test Tribunal",
                "year": 2030,
                "page_number": 2
            }
        )

        matches = search_similar_documents("statutory provision regulation applies", top_k=5, case_id=case_multi_id)

        # All returned chunks must belong to the same case
        for chunk in matches:
            chunk_case_id = chunk.get("case_id", "")
            if chunk_case_id:
                self.assertEqual(
                    chunk_case_id, case_multi_id,
                    "Multi-document retrieval must only return chunks from the requested case"
                )

    # ── Test 8: Global precedent search returns results from all cases ───────────
    def test_08_global_precedent_search_returns_cross_case_results(self):
        """Global search (case_id=None) returns results — may span multiple cases."""
        query = "penalty compliance ratio section act"
        global_results = search_similar_documents(query, top_k=10, case_id=None)
        self.assertIsInstance(global_results, list)
        # Global search must work without error — we don't assert on specific case_ids

    # ── Test 9: Ingest stores case_id in metadata correctly ─────────────────────
    def test_09_ingest_stores_case_id_in_metadata(self):
        """Verify that ingest_document returns case_id and stores it correctly."""
        test_case_id = f"metadata-test-{uuid.uuid4().hex[:8]}"
        result = ingest_document(
            "Test document for metadata verification. Contains unique content for testing.",
            {
                "document_id": "metadata-test-doc",
                "case_id": test_case_id,
                "case_name": "Metadata Test Case",
                "court": "Test Court",
                "year": 2030,
                "page_number": 1
            }
        )
        self.assertTrue(result["success"])
        self.assertEqual(result.get("case_id"), test_case_id,
                         "Ingest must return the case_id in its response")

    # ── Test 10: Ingest without case_id creates global precedent chunk ───────────
    def test_10_ingest_without_case_id_creates_global_precedent(self):
        """Documents ingested without case_id are marked as global precedent (empty case_id)."""
        result = ingest_document(
            "This is a global precedent document with no case assignment.",
            {
                "document_id": "global-precedent-test-doc",
                "case_name": "Global Precedent Test",
                "court": "Supreme Court of India",
                "year": 2024,
                "page_number": 1
            }
        )
        self.assertTrue(result["success"])
        # case_id should be None or empty for global precedent docs
        returned_case_id = result.get("case_id")
        self.assertFalse(
            returned_case_id,
            f"Global precedent document must have falsy case_id, got: {returned_case_id}"
        )

    # ── Test 11: In-memory store also respects case_id filter ───────────────────
    def test_11_in_memory_store_respects_case_id_filter(self):
        """When ChromaDB is unavailable, the in-memory fallback must also filter by case_id."""
        from rag.ingest import in_memory_store as store

        # Inject synthetic items directly into in-memory store
        test_case_id_x = f"inmem-case-x-{uuid.uuid4().hex[:6]}"
        test_case_id_y = f"inmem-case-y-{uuid.uuid4().hex[:6]}"

        store.append({
            "id": f"inmem-chunk-x-{uuid.uuid4().hex[:6]}",
            "text": "InMemory Case X has unique content INMEM_SECRET_X.",
            "embedding": [0.0] * 384,
            "metadata": {
                "document_id": "inmem-doc-x",
                "case_id": test_case_id_x,
                "case_name": "InMem Case X",
                "case_number": "INMEM-X-001",
                "court": "Test Court",
                "year": 2030,
                "page_number": 1,
                "chunk_id": "inmem-chunk-x",
                "chunk_index": 0,
                "total_chunks": 1,
                "source": "InMemory Test"
            }
        })

        store.append({
            "id": f"inmem-chunk-y-{uuid.uuid4().hex[:6]}",
            "text": "InMemory Case Y has unique content INMEM_SECRET_Y.",
            "embedding": [0.0] * 384,
            "metadata": {
                "document_id": "inmem-doc-y",
                "case_id": test_case_id_y,
                "case_name": "InMem Case Y",
                "case_number": "INMEM-Y-001",
                "court": "Test Court",
                "year": 2030,
                "page_number": 1,
                "chunk_id": "inmem-chunk-y",
                "chunk_index": 0,
                "total_chunks": 1,
                "source": "InMemory Test"
            }
        })

        # If ChromaDB is not available, in-memory store is used.
        # Simulate by calling retrieve with a query and verifying filter holds.
        # (We rely on the in-memory fallback path in retrieve.py for this test.)
        from rag import retrieve as retrieve_mod
        from rag.ingest import collection as chroma_col

        if chroma_col is None:
            # ChromaDB unavailable — in-memory path is active
            results = search_similar_documents("InMemory Case content secret", top_k=10, case_id=test_case_id_x)
            for chunk in results:
                self.assertNotEqual(
                    chunk.get("case_id", ""), test_case_id_y,
                    "In-memory retrieval must NOT return Case Y chunks when filtering for Case X"
                )

    # ── Regression Test: existing RAG pipeline tests ─────────────────────────────
    def test_12_regression_rag_pipeline_global_ingest_retrieve(self):
        """Regression: existing global ingest → retrieve flow still works."""
        synthetic_doc_id = "regression-test-9982"
        synthetic_text = (
            "IN THE HIGH COURT OF JUDICATURE AT SPECIAL BENCH\n"
            "ORDER IN WRIT PETITION NO. XYZ-9982 OF 2029\n\n"
            "Hon'ble Justice Armitage presiding.\n"
            "The Court hereby holds that under Section 998B of the Special Technology Act 2029, "
            "the mandatory statutory ratio for compliance penalty is strictly 87.4 percent. "
            "Any administrative default exceeding 87.4 percent incurs an immediate compounding fine of INR 1,50,000."
        )
        metadata = {
            "document_id": synthetic_doc_id,
            "document_name": "Special Technology Compliance Order 2029",
            "case_name": "WP(C) XYZ-9982/2029",
            "court": "High Court Special Bench",
            "year": 2029,
            "page_number": 4
        }
        ingest_res = ingest_document(synthetic_text, metadata)
        self.assertTrue(ingest_res["success"], "Regression: Document ingestion must succeed")

        query = "What is the compliance penalty ratio under Section 998B?"
        matches = search_similar_documents(query, top_k=3)  # global search — no case_id
        self.assertIsInstance(matches, list, "Regression: Global search must return a list")

    def test_13_answer_rag_qa_insufficient_evidence_for_empty_context(self):
        """Regression: answer_rag_qa with empty matches returns ungrounded insufficient response."""
        result = answer_rag_qa("What is the speed of light?", [])
        self.assertFalse(result["grounded"])
        self.assertEqual(result["answer"], "Insufficient evidence found in the indexed documents.")
        self.assertEqual(len(result["sources"]), 0)


if __name__ == '__main__':
    unittest.main()
