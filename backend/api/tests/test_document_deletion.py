"""
Phase 2 Fix: Vector Store Purging on Document Deletion — Unit & Integration Test Suite
===================================================================================
Tests:
  1. Ingest Doc A & Doc B under Case A, Doc C under Case B.
  2. Delete Doc A -> Verify Doc A chunks removed, Doc B and Doc C chunks remain.
  3. Delete Doc B -> Verify Doc B chunks removed, Case B's Doc C chunks remain intact.
  4. Verify idempotent behavior when attempting to delete an already deleted document.
  5. Verify invalid document ID handling.
"""
import unittest
import os
import sys
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.ingest import ingest_document, delete_document_vectors
from rag.retrieve import search_similar_documents


class TestDocumentDeletionVectorPurge(unittest.TestCase):
    """
    Tests vector store purging when a document is deleted.
    Ensures precise document-level purging without affecting other documents or cases.
    """

    @classmethod
    def setUpClass(cls):
        cls.CASE_A_ID = f"test-del-case-A-{uuid.uuid4().hex[:8]}"
        cls.CASE_B_ID = f"test-del-case-B-{uuid.uuid4().hex[:8]}"

        cls.DOC_A_ID = f"doc-del-A-{uuid.uuid4().hex[:8]}"
        cls.DOC_B_ID = f"doc-del-B-{uuid.uuid4().hex[:8]}"
        cls.DOC_C_ID = f"doc-del-C-{uuid.uuid4().hex[:8]}"

        cls.SECRET_A = "SECRET_FACT_DOC_A_TEMPORARY_EVIDENCE"
        cls.SECRET_B = "SECRET_FACT_DOC_B_PERMANENT_RECORD"
        cls.SECRET_C = "SECRET_FACT_DOC_C_OTHER_CASE_DATA"

        # 1. Ingest Doc A (Case A)
        res_a = ingest_document(
            text=f"This is Document A in Case A. It contains {cls.SECRET_A}. Section 100 clause 1.",
            metadata={
                "document_id": cls.DOC_A_ID,
                "case_id": cls.CASE_A_ID,
                "case_name": "Case A Deletion Test",
                "document_name": "DocA.pdf"
            }
        )
        assert res_a["success"]

        # 2. Ingest Doc B (Case A)
        res_b = ingest_document(
            text=f"This is Document B in Case A. It contains {cls.SECRET_B}. Section 200 clause 2.",
            metadata={
                "document_id": cls.DOC_B_ID,
                "case_id": cls.CASE_A_ID,
                "case_name": "Case A Deletion Test",
                "document_name": "DocB.pdf"
            }
        )
        assert res_b["success"]

        # 3. Ingest Doc C (Case B)
        res_c = ingest_document(
            text=f"This is Document C in Case B. It contains {cls.SECRET_C}. Section 300 clause 3.",
            metadata={
                "document_id": cls.DOC_C_ID,
                "case_id": cls.CASE_B_ID,
                "case_name": "Case B Deletion Test",
                "document_name": "DocC.pdf"
            }
        )
        assert res_c["success"]

    @classmethod
    def tearDownClass(cls):
        """Clean up remaining test vectors to avoid mutating global test state."""
        delete_document_vectors(cls.DOC_A_ID)
        delete_document_vectors(cls.DOC_B_ID)
        delete_document_vectors(cls.DOC_C_ID)

    def test_01_purge_doc_a_leaves_doc_b_and_doc_c_intact(self):
        """Purging Doc A must remove Doc A chunks while keeping Doc B and Doc C."""
        # Confirm Doc A is present before deletion
        matches_a_before = search_similar_documents(self.SECRET_A, top_k=5, case_id=self.CASE_A_ID)
        self.assertTrue(any(m.get("document_id") == self.DOC_A_ID for m in matches_a_before))

        # Perform Purge on Doc A
        purge_res = delete_document_vectors(self.DOC_A_ID)
        self.assertTrue(purge_res["success"])
        self.assertGreater(purge_res["deleted_chunks"], 0)

        # Verify Doc A is no longer retrieved
        matches_a_after = search_similar_documents(self.SECRET_A, top_k=5, case_id=self.CASE_A_ID)
        doc_a_chunks_after = [m for m in matches_a_after if m.get("document_id") == self.DOC_A_ID]
        self.assertEqual(len(doc_a_chunks_after), 0)

        # Verify Doc B in Case A is STILL present and retrievable
        matches_b = search_similar_documents(self.SECRET_B, top_k=5, case_id=self.CASE_A_ID)
        self.assertTrue(any(m.get("document_id") == self.DOC_B_ID for m in matches_b))

        # Verify Doc C in Case B is STILL present and retrievable
        matches_c = search_similar_documents(self.SECRET_C, top_k=5, case_id=self.CASE_B_ID)
        self.assertTrue(any(m.get("document_id") == self.DOC_C_ID for m in matches_c))

    def test_02_purge_doc_b_leaves_case_b_doc_c_intact(self):
        """Purging Doc B from Case A must not affect Case B's Doc C."""
        purge_res = delete_document_vectors(self.DOC_B_ID)
        self.assertTrue(purge_res["success"])
        self.assertGreater(purge_res["deleted_chunks"], 0)

        # Doc B must be gone
        matches_b_after = search_similar_documents(self.SECRET_B, top_k=5, case_id=self.CASE_A_ID)
        doc_b_chunks_after = [m for m in matches_b_after if m.get("document_id") == self.DOC_B_ID]
        self.assertEqual(len(doc_b_chunks_after), 0)

        # Doc C in Case B must remain intact
        matches_c = search_similar_documents(self.SECRET_C, top_k=5, case_id=self.CASE_B_ID)
        self.assertTrue(any(m.get("document_id") == self.DOC_C_ID for m in matches_c))

    def test_03_idempotent_deletion(self):
        """Deleting an already deleted document should return success with 0 deleted chunks."""
        # Doc A was already deleted in test_01
        purge_res = delete_document_vectors(self.DOC_A_ID)
        self.assertTrue(purge_res["success"])
        self.assertEqual(purge_res["deleted_chunks"], 0)

    def test_04_invalid_document_id_handling(self):
        """Passing empty or whitespace document_id returns explicit error."""
        res_empty = delete_document_vectors("")
        self.assertFalse(res_empty["success"])
        self.assertEqual(res_empty["deleted_chunks"], 0)

        res_none = delete_document_vectors(None)
        self.assertFalse(res_none["success"])


if __name__ == "__main__":
    unittest.main()
