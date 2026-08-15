import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.ingest import ingest_document

def run_seed_ingestion():
    judgments_dir = os.path.join(os.path.dirname(__file__), "sample_judgments")
    if not os.path.exists(judgments_dir):
        print(f"Directory {judgments_dir} not found.")
        return

    files = [f for f in os.listdir(judgments_dir) if f.endswith(".txt")]
    print(f"Found {len(files)} landmark judgment seed files for vector DB ingestion.")

    for f in files:
        filepath = os.path.join(judgments_dir, f)
        with open(filepath, "r", encoding="utf-8") as file:
            content = file.read()
        
        meta = {
            "doc_id": f"seed_{f}",
            "case_number": f.replace(".txt", "").upper().replace("_", "/"),
            "source": "Supreme Court Reporter",
            "title": f.replace("_", " ").replace(".txt", "").title()
        }

        res = ingest_document(content, meta)
        print(f"Ingested {f}: {res['chunks_ingested']} chunks stored.")

if __name__ == "__main__":
    run_seed_ingestion()
