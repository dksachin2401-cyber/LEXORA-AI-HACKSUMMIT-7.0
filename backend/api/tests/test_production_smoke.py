import os
import sys
import unittest
from pathlib import Path

# Add backend and api directory to path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(root_dir))
sys.path.append(str(root_dir / "api"))

os.environ["TESTING"] = "true"
os.environ["ENVIRONMENT"] = "production"

from fastapi import HTTPException
from api.main import (
    health_check,
    readiness_check,
    read_root,
    verify_internal_key,
    get_corpus_health,
    get_corpus_stats,
    post_deep_research,
    ResearchRequest,
    ChatLegalRequest,
    chat_legal_endpoint,
)

class TestProductionSmoke(unittest.TestCase):

    def test_01_liveness_health_endpoint(self):
        """GET /health liveness probe must work without API keys."""
        res = health_check()
        self.assertEqual(res.get("status"), "alive")
        self.assertEqual(res.get("service"), "Lexora AI Pipeline")

    def test_02_readiness_endpoint(self):
        """GET /ready readiness probe returns status code 200 or 503."""
        res = readiness_check()
        self.assertIn(res.status_code, [200, 503])

    def test_03_root_service_info(self):
        """GET / root endpoint returns active service status."""
        res = read_root()
        self.assertEqual(res.get("status"), "active")

    def test_04_unauthenticated_request_rejected(self):
        """verify_internal_key rejects requests when key is invalid."""
        with self.assertRaises(HTTPException) as ctx:
            verify_internal_key(x_internal_api_key="invalid-secret-key")
        self.assertEqual(ctx.exception.status_code, 403)

    def test_05_valid_internal_key_accepted(self):
        """verify_internal_key accepts valid key."""
        from api.main import INTERNAL_API_KEY
        result = verify_internal_key(x_internal_api_key=INTERNAL_API_KEY)
        self.assertTrue(result)

    def test_06_corpus_health_audit(self):
        """get_corpus_health endpoint returns structured health report."""
        res = get_corpus_health()
        self.assertTrue(res.get("success"))
        self.assertIn("health_audit", res)

    def test_07_corpus_stats_audit(self):
        """get_corpus_stats endpoint returns valid chunk stats."""
        res = get_corpus_stats()
        self.assertTrue(res.get("success"))
        self.assertIn("total_chunks", res)

    def test_08_empty_chat_query_rejected(self):
        """chat_legal_endpoint rejects empty query with HTTP 400."""
        req = ChatLegalRequest(query="   ")
        with self.assertRaises(HTTPException) as ctx:
            chat_legal_endpoint(req)
        self.assertEqual(ctx.exception.status_code, 400)

    def test_09_research_endpoint_structured_output(self):
        """post_deep_research returns deep legal research pipeline output."""
        req = ResearchRequest(question="Bail principles under BNSS", research_depth="QUICK")
        res = post_deep_research(req)
        self.assertTrue(res.get("success"))
        self.assertIn("answer", res)
        self.assertIn("evidence_pack", res)

    def test_10_production_environment_flag(self):
        """Environment mode reads production setting."""
        self.assertEqual(os.environ.get("ENVIRONMENT"), "production")

if __name__ == "__main__":
    unittest.main()
