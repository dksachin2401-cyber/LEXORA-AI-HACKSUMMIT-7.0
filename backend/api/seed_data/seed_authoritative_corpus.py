"""
Phase 7 Authoritative Corpus Ingestion Runner
==============================================
Ingests initial high-value Indian legal statutes and precedents with full provenance metadata.
"""

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.pipeline import ingest_directory_corpus
from rag.ingest import ingest_document


def run_authoritative_ingestion():
    corpus_dir = os.path.join(os.path.dirname(__file__), "authoritative_corpus")
    if not os.path.exists(corpus_dir):
        print(f"[INGESTION] Corpus directory {corpus_dir} not found.")
        return

    meta = {
        "source_name": "India Code / Legislative Department, Ministry of Law and Justice",
        "source_url": "https://www.indiacode.nic.in",
        "authority_level": 1,
        "jurisdiction": "India",
        "status": "IN_FORCE",
        "corpus": "GLOBAL_STATUTES"
    }

    report = ingest_directory_corpus(corpus_dir, meta)
    print(f"=== AUTHORITATIVE CORPUS INGESTION REPORT ===")
    print(f"  Source                  : {report['source']}")
    print(f"  Documents Ingested      : {report['documents']}")
    print(f"  Total Chunks Stored     : {report['chunks']}")
    print(f"  Duplicates Detected     : {report['duplicates_detected']}")
    print(f"  Metadata Completeness   : {report['metadata_completeness'] * 100}%")
    print(f"  Ingestion Errors        : {len(report['errors'])}")
    print(f"=============================================")

if __name__ == "__main__":
    run_authoritative_ingestion()
