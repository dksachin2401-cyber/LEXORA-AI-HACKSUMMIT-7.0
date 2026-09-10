import os
import sys
import json
import hashlib
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(root_dir / "backend"))
sys.path.append(str(root_dir / "backend" / "api"))

def restore_chroma(backup_path_str: str):
    print("==========================================")
    print("LEXORA ChromaDB Legal Corpus Restore")
    print("==========================================")

    if os.getenv("CONFIRM_RESTORE") != "yes":
        print("[SECURITY WARNING] Set CONFIRM_RESTORE=yes to execute ChromaDB restore.")
        sys.exit(1)

    backup_file = Path(backup_path_str)
    if not backup_file.exists():
        print(f"[ERROR] Backup file not found: {backup_file}")
        sys.exit(1)

    with open(backup_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data.get("chunks", [])
    print(f"[1/2] Re-ingesting {len(chunks)} chunks from backup payload...")

    from api.rag.ingest import ingest_document

    restored_count = 0
    for chunk in chunks:
        doc = chunk.get("document")
        meta = chunk.get("metadata", {})
        if doc and meta:
            ingest_document(doc, meta)
            restored_count += 1

    print("[2/2] Running Legal Corpus Health Verification...")
    from api.rag.health import check_corpus_health
    health = check_corpus_health()

    print(f"CHROMA RESTORE: PASS — Restored {restored_count} chunks. Corpus Health: {health.get('status')}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python restore_chroma.py <path-to-backup.json>")
        sys.exit(1)
    restore_chroma(sys.argv[1])
