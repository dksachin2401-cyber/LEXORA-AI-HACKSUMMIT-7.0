import os
import uuid
from typing import List, Dict, Any

try:
    import chromadb
    from chromadb.config import Settings
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
    """
    Chunks text into ~500 token blocks (~2000 characters) with overlap.
    """
    chunks = []
    if not text:
        return chunks
    
    start = 0
    text_len = len(text)
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= text_len:
            break
        start += (chunk_size - overlap)
    
    return chunks

def ingest_document(text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Chunks, embeds, and upserts a document into ChromaDB.
    """
    doc_id = metadata.get("doc_id", str(uuid.uuid4()))
    case_number = metadata.get("case_number", "UNKNOWN")
    source = metadata.get("source", "user_upload")
    title = metadata.get("title", "Legal Document")

    chunks = chunk_text(text)
    if not chunks:
        return {"success": False, "chunks_ingested": 0, "error": "Empty text provided."}

    chunk_ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "doc_id": doc_id,
            "case_number": case_number,
            "source": source,
            "title": title,
            "chunk_index": i,
            "total_chunks": len(chunks)
        } for i in range(len(chunks))
    ]

    # Generate Embeddings
    if embedder:
        embeddings = embedder.encode(chunks).tolist()
    else:
        # Dummy embedding placeholder if sentence-transformers isn't loaded
        embeddings = [[0.0] * 384 for _ in chunks]

    if collection:
        collection.upsert(
            ids=chunk_ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas
        )
    else:
        for cid, doc, emb, meta in zip(chunk_ids, chunks, embeddings, metadatas):
            in_memory_store.append({
                "id": cid,
                "text": doc,
                "embedding": emb,
                "metadata": meta
            })

    return {
        "success": True,
        "doc_id": doc_id,
        "chunks_ingested": len(chunks),
        "case_number": case_number
    }
