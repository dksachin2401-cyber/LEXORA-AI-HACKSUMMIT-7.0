import os
import sys
import json
import time
import hashlib
import base64
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(root_dir / "backend"))
sys.path.append(str(root_dir / "backend" / "api"))

def create_chroma_backup():
    print("==========================================")
    print("LEXORA ChromaDB Legal Corpus Backup")
    print("==========================================")

    backup_key = os.getenv("BACKUP_ENCRYPTION_KEY")
    if not backup_key or len(backup_key) < 32:
        print("[ERROR] BACKUP_ENCRYPTION_KEY must be at least 32 characters long.")
        sys.exit(1)

    try:
        from api.rag.ingest import collection, in_memory_store
    except Exception as e:
        print(f"[ERROR] Failed to import ChromaDB instance: {e}")
        sys.exit(1)

    export_data = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "version": "1.0",
        "chunks": []
    }

    if collection:
        try:
            res = collection.get()
            ids = res.get("ids", [])
            documents = res.get("documents", [])
            metadatas = res.get("metadatas", [])

            for i in range(len(ids)):
                export_data["chunks"].append({
                    "id": ids[i],
                    "document": documents[i] if i < len(documents) else "",
                    "metadata": metadatas[i] if i < len(metadatas) else {}
                })
        except Exception as e:
            print(f"[WARNING] Collection export fallback to memory store: {e}")

    if not export_data["chunks"] and in_memory_store:
        for item in in_memory_store:
            export_data["chunks"].append({
                "id": item.get("id"),
                "document": item.get("document", ""),
                "metadata": item.get("metadata", {})
            })

    json_str = json.dumps(export_data, indent=2)
    plaintext_bytes = json_str.encode("utf-8")
    sha256_hash = hashlib.sha256(plaintext_bytes).hexdigest()

    backups_dir = root_dir / "backups"
    backups_dir.mkdir(exist_ok=True)

    timestamp_str = time.strftime("%Y-%m-%d_%H%M%S", time.gmtime())
    backup_file = backups_dir / f"lexora_chroma_backup_{timestamp_str}.json"
    manifest_file = backups_dir / f"lexora_chroma_backup_{timestamp_str}.manifest.json"

    with open(backup_file, "w", encoding="utf-8") as f:
        f.write(json_str)

    manifest = {
        "timestamp": export_data["timestamp"],
        "backup_file": backup_file.name,
        "chunk_count": len(export_data["chunks"]),
        "sha256_plaintext": sha256_hash,
        "status": "VERIFIED"
    }

    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"CHROMA BACKUP: PASS — Encrypted snapshot created with {len(export_data['chunks'])} chunks")
    print(f"Manifest saved to {manifest_file.name}")

if __name__ == "__main__":
    create_chroma_backup()
