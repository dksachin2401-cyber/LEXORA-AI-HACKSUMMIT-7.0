"""
Phase 7: Authoritative Ingestion Pipeline
==========================================
Configurable multi-source ingestion pipeline:
Validate -> Load/Extract -> Content Hash -> Metadata Enrich -> Structure Chunk -> Embed -> Index -> Verification Report.
"""

import os
import sys
import logging
import datetime
from typing import Dict, Any, List, Optional
from rag.corpus_metadata import normalize_metadata, compute_content_hash, calculate_metadata_completeness
from rag.ingest import ingest_document

logger = logging.getLogger(__name__)


class SourceConfig:
    def __init__(
        self,
        source_name: str,
        source_type: str, # "LOCAL_DIRECTORY", "LOCAL_FILE", "OFFICIAL_URL"
        authority_level: int = 1,
        jurisdiction: str = "India",
        enabled: bool = True,
        update_frequency: str = "DAILY"
    ):
        self.source_name = source_name
        self.source_type = source_type
        self.authority_level = authority_level
        self.jurisdiction = jurisdiction
        self.enabled = enabled
        self.update_frequency = update_frequency


def ingest_directory_corpus(directory_path: str, default_metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Batch directory ingestion pipeline.
    Reads TXT/PDF files from directory_path, computes hashes, chunks, and indexes.
    Produces comprehensive ingestion report.
    """
    if not os.path.exists(directory_path):
        return {
            "success": False,
            "error": f"Directory not found: {directory_path}",
            "documents_ingested": 0,
            "total_chunks": 0
        }

    files = [f for f in os.listdir(directory_path) if f.endswith(".txt") or f.endswith(".pdf") or f.endswith(".md")]
    total_docs = 0
    total_chunks = 0
    duplicates = 0
    completeness_scores = []
    errors = []

    for fname in files:
        fpath = os.path.join(directory_path, fname)
        try:
            content = ""
            if fname.endswith(".pdf"):
                import fitz  # PyMuPDF
                doc = fitz.open(fpath)
                content = "\n".join([page.get_text() for page in doc])
            else:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()

            if not content.strip():
                continue

            file_meta = dict(default_metadata)
            file_meta["document_id"] = f"corpus_{fname}"
            file_meta["document_name"] = fname.replace("_", " ").replace(".txt", "").replace(".pdf", "").title()
            file_meta["title"] = file_meta["document_name"]
            file_meta["act"] = file_meta["document_name"]

            res = ingest_document(content, file_meta)
            if res.get("success"):
                total_docs += 1
                total_chunks += res.get("chunks_ingested", 0)
                completeness_scores.append(res.get("metadata_completeness", 0.0))
                if res.get("is_duplicate"):
                    duplicates += 1
            else:
                errors.append(f"{fname}: {res.get('error')}")

        except Exception as e:
            errors.append(f"{fname}: {str(e)}")

    avg_completeness = round(sum(completeness_scores) / len(completeness_scores), 2) if completeness_scores else 0.0

    return {
        "success": True,
        "source": default_metadata.get("source_name", "Authoritative Legal Pipeline"),
        "documents": total_docs,
        "chunks": total_chunks,
        "duplicates_detected": duplicates,
        "metadata_completeness": avg_completeness,
        "errors": errors,
        "timestamp": datetime.datetime.now().isoformat()
    }
