"""
Corpus Health and Consistency Check Module for LEXORA (Phase 8)
===============================================================
Performs comprehensive health audits of indexed legal corpora in ChromaDB and in-memory store.
Checks:
- Total chunk & document count
- Duplicate hash detection
- Orphaned chunks (missing required metadata)
- Corpus breakdown (GLOBAL_STATUTES, GLOBAL_PRECEDENTS, CASE_SCOPED, etc.)
- Metadata completeness percentage
- Authority level distribution
"""

import logging
from typing import Dict, Any, List
from collections import Counter
from rag.ingest import collection, in_memory_store
from rag.corpus_metadata import calculate_metadata_completeness, compute_content_hash

logger = logging.getLogger(__name__)

def check_corpus_health() -> Dict[str, Any]:
    """
    Executes a health and consistency audit over all vector store entries.
    Returns structured JSON with metrics, breakdowns, and issues.
    """
    all_metadatas: List[Dict[str, Any]] = []
    all_documents: List[str] = []

    if collection is not None:
        try:
            res = collection.get(include=["metadatas", "documents"])
            all_metadatas = res.get("metadatas") or []
            all_documents = res.get("documents") or []
        except Exception as e:
            logger.error(f"Error reading from ChromaDB collection: {e}")
            all_metadatas = []
            all_documents = []

    # Fallback or merge in_memory_store if collection is empty
    if not all_metadatas and in_memory_store:
        all_metadatas = [item.get("metadata", {}) for item in in_memory_store]
        all_documents = [item.get("document", "") for item in in_memory_store]

    total_chunks = len(all_metadatas)
    if total_chunks == 0:
        return {
            "status": "EMPTY",
            "total_chunks": 0,
            "total_documents": 0,
            "metadata_completeness_pct": 0.0,
            "duplicate_chunks_count": 0,
            "orphaned_chunks_count": 0,
            "corpora_breakdown": {},
            "authority_level_breakdown": {},
            "issues": ["No documents or chunks found in vector store."]
        }

    doc_ids = set()
    content_hashes = Counter()
    corpora = Counter()
    authority_levels = Counter()
    completeness_scores = []
    orphaned_chunks = 0
    issues = []

    for meta, doc_text in zip(all_metadatas, all_documents):
        doc_id = meta.get("doc_id") or meta.get("document_id") or meta.get("title")
        if doc_id:
            doc_ids.add(doc_id)
        else:
            orphaned_chunks += 1

        c_hash = meta.get("chunk_hash") or (compute_content_hash(doc_text) if doc_text else meta.get("content_hash"))
        if c_hash:
            content_hashes[c_hash] += 1

        corpus = meta.get("corpus") or meta.get("document_type") or "GLOBAL_UNCLASSIFIED"
        corpora[corpus] += 1

        auth = str(meta.get("authority_level") or 1)
        authority_levels[auth] += 1

        score = calculate_metadata_completeness(meta)
        completeness_scores.append(score)

    duplicate_chunks = sum(count - 1 for count in content_hashes.values() if count > 1)
    avg_completeness = round((sum(completeness_scores) / len(completeness_scores)) * 100, 1) if completeness_scores else 0.0

    if orphaned_chunks > 0:
        issues.append(f"Detected {orphaned_chunks} orphaned chunks missing document IDs.")
    if duplicate_chunks > 0:
        issues.append(f"Detected {duplicate_chunks} duplicate chunk content hashes.")
    if avg_completeness < 80.0:
        issues.append(f"Average metadata completeness ({avg_completeness}%) is below target threshold (80.0%).")

    status = "HEALTHY" if not issues else "NEEDS_ATTENTION"

    return {
        "status": status,
        "total_chunks": total_chunks,
        "total_documents": len(doc_ids),
        "metadata_completeness_pct": avg_completeness,
        "duplicate_chunks_count": duplicate_chunks,
        "orphaned_chunks_count": orphaned_chunks,
        "corpora_breakdown": dict(corpora),
        "authority_level_breakdown": dict(authority_levels),
        "issues": issues
    }

if __name__ == "__main__":
    import json
    report = check_corpus_health()
    print(json.dumps(report, indent=2))
