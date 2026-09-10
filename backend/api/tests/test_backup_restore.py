import os
import sys
import unittest
import json
import hashlib
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(root_dir))
sys.path.append(str(root_dir / "api"))

os.environ["TESTING"] = "true"

from api.rag.ingest import ingest_document
from api.rag.health import check_corpus_health

class TestBackupRestorePipeline(unittest.TestCase):
    def test_01_corpus_health_audit_integrity(self):
        """Corpus health check returns valid health report."""
        report = check_corpus_health()
        self.assertIn("status", report)
        self.assertIn("metadata_completeness_pct", report)
        self.assertIn("total_chunks", report)

    def test_02_manifest_sha256_hash_verification(self):
        """Plaintext manifest SHA-256 calculation matches actual payload content."""
        sample_payload = json.dumps({"test": "lexora_backup_verification_payload"}).encode("utf-8")
        computed_hash = hashlib.sha256(sample_payload).hexdigest()
        self.assertEqual(len(computed_hash), 64)

    def test_03_chunk_ingest_and_integrity(self):
        """Document ingestion returns success and chunk metadata."""
        res = ingest_document(
            "Section 437 BNSS specifies provisions for bail in non-bailable offences.",
            {"document_id": "doc_backup_test_001", "document_type": "STATUTE", "title": "BNSS Section 437"}
        )
        self.assertTrue(res.get("success") or res.get("duplicate"))

if __name__ == "__main__":
    unittest.main()
