import os
import uuid
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

from rag.corpus_metadata import normalize_metadata, calculate_metadata_completeness, compute_content_hash, LegalCorpusType
from rag.chunker import chunk_legal_document, fallback_chunk_text

try:
    import chromadb
except ImportError:
    chromadb = None

try:
    from sentence_transformers import SentenceTransformer
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
except Exception:
    embedder = None

# Initialize Chroma DB client
CHROMA_DATA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")
os.makedirs(CHROMA_DATA_PATH, exist_ok=True)

if chromadb:
    chroma_client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)
    collection = chroma_client.get_or_create_collection(name="lexora_judgments")
else:
    chroma_client = None
    collection = None

# In-memory storage fallback if chromadb is unavailable
in_memory_store = []


def chunk_text(text: str, chunk_size: int = 2000, overlap: int = 400) -> List[str]:
    """Backward-compatible simple text chunker."""
    raw_chunks = fallback_chunk_text(text, {}, chunk_size=chunk_size, overlap=overlap)
    return [c["text"] for c in raw_chunks]


def ingest_document(text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Phase 7 Authoritative Document Ingestion.
    1. Normalizes provenance metadata (citation, source_url, authority_level, status).
    2. Performs structure-aware or paragraph-aware chunking.
    3. Generates content hash SHA-256 for duplicate detection.
    4. Upserts into persistent ChromaDB / in-memory store.
    5. Returns ingestion report with metadata completeness score.
    """
    if not text or not text.strip():
        return {"success": False, "chunks_ingested": 0, "error": "Empty text provided."}

    norm_meta = normalize_metadata(metadata, text)
    doc_id = norm_meta["document_id"]
    case_id = norm_meta["case_id"]
    content_hash = norm_meta["content_hash"]

    # Duplicate Detection Check
    existing_dup = False
    if collection:
        try:
            matched = collection.get(where={"content_hash": content_hash})
            if matched and matched.get("ids") and len(matched["ids"]) > 0:
                existing_dup = True
        except Exception:
            pass
    else:
        for item in in_memory_store:
            if item.get("metadata", {}).get("content_hash") == content_hash and item.get("metadata", {}).get("document_id") != doc_id:
                existing_dup = True
                break

    if existing_dup:
        logger.info(f"[INGEST DUP] Document with hash {content_hash[:10]} already indexed.")
        return {
            "success": True,
            "document_id": doc_id,
            "chunks_ingested": 0,
            "duplicate": True,
            "is_duplicate": True,
            "metadata_completeness": calculate_metadata_completeness(norm_meta)
        }

    # Execute Structure-Aware Chunking
    chunk_objs = chunk_legal_document(text, norm_meta)
    if not chunk_objs:
        return {"success": False, "chunks_ingested": 0, "error": "Failed to chunk document."}

    chunks_text = [c["text"] for c in chunk_objs]
    chunk_ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks_text))]

    metadatas = []
    for i, c in enumerate(chunk_objs):
        meta_i = dict(c["metadata"])
        meta_i["total_chunks"] = len(chunks_text)
        meta_i["chunk_id"] = f"{doc_id}_chunk_{i}"
        meta_i["chunk_hash"] = compute_content_hash(c["text"])
        metadatas.append(meta_i)

    # Generate Embeddings
    if embedder:
        embeddings = embedder.encode(chunks_text).tolist()
    else:
        embeddings = [[0.0] * 384 for _ in chunks_text]

    if collection:
        collection.upsert(
            ids=chunk_ids,
            documents=chunks_text,
            embeddings=embeddings,
            metadatas=metadatas
        )
    else:
        for cid, doc, emb, meta in zip(chunk_ids, chunks_text, embeddings, metadatas):
            existing_idx = next(
                (idx for idx, item in enumerate(in_memory_store) if item["id"] == cid), -1
            )
            item_data = {
                "id": cid,
                "text": doc,
                "embedding": emb,
                "metadata": meta
            }
            if existing_idx >= 0:
                in_memory_store[existing_idx] = item_data
            else:
                in_memory_store.append(item_data)

    completeness = calculate_metadata_completeness(norm_meta)

    return {
        "success": True,
        "doc_id": doc_id,
        "case_id": case_id or None,
        "chunks_ingested": len(chunks_text),
        "embedding_model": "all-MiniLM-L6-v2",
        "embedding_dimension": 384,
        "status": "INDEXED",
        "case_name": norm_meta["case_name"],
        "content_hash": content_hash,
        "metadata_completeness": completeness,
        "authority_level": norm_meta["authority_level"],
        "corpus": norm_meta["corpus"],
        "is_duplicate": existing_dup
    }


def delete_document_vectors(document_id: str) -> Dict[str, Any]:
    """
    Deletes ChromaDB chunks or in-memory vectors belonging strictly to document_id.
    Idempotent and safe: never deletes chunks belonging to other documents or cases.
    """
    if not document_id or not str(document_id).strip():
        return {"success": False, "deleted_chunks": 0, "error": "Invalid document_id provided."}

    deleted_count = 0
    document_id = str(document_id).strip()

    if collection:
        try:
            existing = collection.get(where={"document_id": document_id})
            if not existing or not existing.get("ids"):
                existing = collection.get(where={"document_id": {"$eq": document_id}})

            ids = existing.get("ids", []) if existing else []
            if ids:
                collection.delete(ids=ids)
                deleted_count = len(ids)
            else:
                try:
                    collection.delete(where={"document_id": document_id})
                except Exception:
                    pass
        except Exception as e:
            logger.error("[VECTOR PURGE] ChromaDB delete error: %s", e)
            return {"success": False, "document_id": document_id, "deleted_chunks": 0, "error": str(e)}

    global in_memory_store
    initial_len = len(in_memory_store)
    filtered = [
        item for item in in_memory_store
        if item.get("metadata", {}).get("document_id") != document_id
    ]
    in_mem_deleted = initial_len - len(filtered)
    in_memory_store[:] = filtered
    deleted_count = max(deleted_count, in_mem_deleted)

    return {
        "success": True,
        "document_id": document_id,
        "deleted_chunks": deleted_count,
        "status": "PURGED"
    }
