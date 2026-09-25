import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add backend and api directory to path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(root_dir))
sys.path.append(str(root_dir / "api"))

os.environ["TESTING"] = "true"

from llm.client import (
    call_llm,
    get_openai_client,
    get_gemini_model,
    unified_legal_chat,
    generate_summary,
    answer_rag_qa
)
from llm.research_engine import execute_deep_legal_research

class TestAiProvidersAndFallback(unittest.TestCase):
    def setUp(self):
        os.environ["TESTING"] = "true"

    def test_dynamic_client_instantiation_without_keys(self):
        """When keys are unset or placeholder, clients should return None without error."""
        with patch.dict(os.environ, {"OPENAI_API_KEY": "", "GEMINI_API_KEY": ""}):
            # Reset cached instances
            import llm.client as lc
            lc._openai_client = None
            lc._gemini_model = None
            lc._gemini_configured = False

            self.assertIsNone(get_openai_client())
            self.assertIsNone(get_gemini_model())

    def test_call_llm_openai_success(self):
        """When OpenAI is configured and succeeds, call_llm returns OpenAI response."""
        mock_client = MagicMock()
        mock_completion = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = "OpenAI generated legal synthesis."
        mock_completion.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_completion

        with patch("llm.client.get_openai_client", return_value=mock_client), \
             patch("llm.client.get_gemini_model", return_value=None), \
             patch.dict(os.environ, {"AI_PROVIDER": "openai"}):
            res = call_llm("Summarize case facts", provider="openai")
            self.assertEqual(res, "OpenAI generated legal synthesis.")
            mock_client.chat.completions.create.assert_called_once()

    def test_call_llm_gemini_success(self):
        """When Gemini is configured and succeeds, call_llm returns Gemini response."""
        mock_model = MagicMock()
        mock_res = MagicMock()
        mock_res.text = "Gemini generated legal opinion."
        mock_model.generate_content.return_value = mock_res

        with patch("llm.client.get_openai_client", return_value=None), \
             patch("llm.client.get_gemini_model", return_value=mock_model), \
             patch.dict(os.environ, {"AI_PROVIDER": "gemini"}):
            res = call_llm("Analyze statute", provider="gemini")
            self.assertEqual(res, "Gemini generated legal opinion.")
            mock_model.generate_content.assert_called_once()

    def test_call_llm_fallback_from_openai_to_gemini(self):
        """When primary OpenAI fails, it gracefully falls back to Gemini."""
        mock_openai = MagicMock()
        mock_openai.chat.completions.create.side_effect = Exception("Rate limit or quota exceeded")

        mock_gemini = MagicMock()
        mock_res = MagicMock()
        mock_res.text = "Gemini fallback legal answer."
        mock_gemini.generate_content.return_value = mock_res

        with patch("llm.client.get_openai_client", return_value=mock_openai), \
             patch("llm.client.get_gemini_model", return_value=mock_gemini), \
             patch.dict(os.environ, {"AI_PROVIDER": "openai"}):
            res = call_llm("Test prompt", provider="openai")
            self.assertEqual(res, "Gemini fallback legal answer.")
            mock_openai.chat.completions.create.assert_called_once()
            mock_gemini.generate_content.assert_called_once()

    def test_call_llm_fallback_from_gemini_to_openai(self):
        """When primary Gemini fails, it gracefully falls back to OpenAI."""
        mock_gemini = MagicMock()
        mock_gemini.generate_content.side_effect = Exception("Service unavailable")

        mock_openai = MagicMock()
        mock_completion = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = "OpenAI fallback legal answer."
        mock_completion.choices = [mock_choice]
        mock_openai.chat.completions.create.return_value = mock_completion

        with patch("llm.client.get_openai_client", return_value=mock_openai), \
             patch("llm.client.get_gemini_model", return_value=mock_gemini), \
             patch.dict(os.environ, {"AI_PROVIDER": "gemini"}):
            res = call_llm("Test prompt", provider="gemini")
            self.assertEqual(res, "OpenAI fallback legal answer.")
            mock_gemini.generate_content.assert_called_once()
            mock_openai.chat.completions.create.assert_called_once()

    def test_call_llm_graceful_rag_fallback_when_both_unavailable(self):
        """When both LLMs fail/unset, call_llm returns None, and high-level RAG engines fall back gracefully."""
        with patch("llm.client.get_openai_client", return_value=None), \
             patch("llm.client.get_gemini_model", return_value=None):
            res = call_llm("Test prompt")
            self.assertIsNone(res)

            # Unified legal chat fallback check
            chat_res = unified_legal_chat("What is Section 302 IPC?")
            self.assertTrue(chat_res["grounded"])
            self.assertIn("Section 302", chat_res["answer"])

            # Deep legal research fallback check
            research_res = execute_deep_legal_research("What is bail procedure under Section 437 CrPC?")
            self.assertIn("answer", research_res)
            self.assertTrue(len(research_res["answer"]) > 10)

if __name__ == '__main__':
    unittest.main()
