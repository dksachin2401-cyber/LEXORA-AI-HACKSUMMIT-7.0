import unittest
import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ocr.extract import extract_text_from_file
from rag.ingest import ingest_document
from rag.retrieve import search_similar_documents

class TestDocumentPipelineIntegration(unittest.TestCase):

    def test_successful_pdf_text_extraction(self):
        # Plain text file or native PDF simulation
        sample_bytes = b"IN THE HIGH COURT OF DELHI\nWRIT PETITION 1042/2026\nJudicial compliance order text."
        res = extract_text_from_file(sample_bytes, "petition.txt")
        
        self.assertTrue(res["success"], "Plain text/native extraction must succeed")
        self.assertIn("WRIT PETITION 1042/2026", res["raw_text"])

    def test_scanned_pdf_ocr_path_fallback(self):
        # Unsupported / low-confidence bytes return failure gracefully when OCR unavailable
        sample_bytes = b"\x00\x01\x02\x03\x04"
        res = extract_text_from_file(sample_bytes, "scanned_image.png")
        
        # Must return explicit failure dictionary, not crash
        self.assertIn("success", res)
        if not res["success"]:
            self.assertIn("error", res)

    def test_extraction_failure_handling(self):
        # Unsupported file extension
        res = extract_text_from_file(b"invalid content", "file.unsupported_ext")
        self.assertFalse(res["success"], "Unsupported extension must fail gracefully")
        self.assertIn("error", res)

    def test_chromadb_ingestion_and_idempotent_duplicate_upload(self):
        doc_id = "doc_test_idempotent_8832"
        metadata = {
            "document_id": doc_id,
            "document_name": "Idempotent_Test_Affidavit.pdf",
            "case_name": "WP(C) 8832/2026",
            "court": "Delhi High Court",
            "year": 2026,
            "page_number": 1
        }
        text = "This is a unique statutory affidavit for testing idempotent ChromaDB ingestion."

        # First Ingestion
        res1 = ingest_document(text, metadata)
        self.assertTrue(res1["success"])
        self.assertEqual(res1["doc_id"], doc_id)

        # Duplicate Second Ingestion (Idempotent Overwrite)
        res2 = ingest_document(text, metadata)
        self.assertTrue(res2["success"])
        self.assertEqual(res2["doc_id"], doc_id)
        self.assertEqual(res2["chunks_ingested"], res1["chunks_ingested"])

        # Retrieve chunk to verify metadata preservation
        matches = search_similar_documents("idempotent ChromaDB ingestion", top_k=1)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0]["document_id"], doc_id)

    def test_chromadb_failure_handling(self):
        # Ingesting empty text must fail gracefully with error
        res = ingest_document("", {"doc_id": "empty_test"})
        self.assertFalse(res["success"])
        self.assertEqual(res["error"], "Empty text provided.")

if __name__ == '__main__':
    unittest.main()
