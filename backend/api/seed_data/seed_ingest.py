import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.ingest import ingest_document
from seed_data.seed_authoritative_corpus import run_authoritative_ingestion

def run_seed_ingestion():
    judgments_dir = os.path.join(os.path.dirname(__file__), "sample_judgments")
    if os.path.exists(judgments_dir):
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
                "title": f.replace("_", " ").replace(".txt", "").title(),
                "document_type": "JUDGMENT",
                "corpus": "GLOBAL_PRECEDENTS",
                "authority_level": 1,
                "issuing_authority": "Supreme Court of India",
                "currentness_status": "IN_FORCE"
            }

            res = ingest_document(content, meta)
            print(f"Ingested {f}: {res['chunks_ingested']} chunks stored.")

    # Also ingest authoritative statutory corpus
    try:
        run_authoritative_ingestion()
    except Exception as e:
        print(f"Authoritative corpus ingestion notice: {e}")

if __name__ == "__main__":
    run_seed_ingestion()
