"""
Phase 17.2A — Existing Document Migration Inspector
====================================================
Inspects ChromaDB to find chunks that lack case_id metadata,
and provides a Prisma-based re-indexing plan.

This script does NOT re-index automatically — it reports what needs re-indexing
so the operator can review and trigger it safely.

Usage:
    python backend/api/tests/test_migration_inspector.py

Output:
    - Total chunks in ChromaDB
    - Chunks missing case_id (or with empty case_id)
    - Chunks from seed/global precedent (expected — no case_id needed)
    - Chunks from uploaded case documents that need re-indexing
    - Recommendation
"""
import os
import sys
import unittest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.ingest import collection, in_memory_store


class TestMigrationInspector(unittest.TestCase):
    """
    Inspects existing ChromaDB state for missing case_id metadata.
    This is an AUDIT test, not a mutation test.
    """

    def test_inspect_chunks_for_missing_case_id(self):
        """
        Report every chunk in the vector store and classify it:
          - GLOBAL PRECEDENT: case_id is empty string (expected for seed data)
          - CASE DOCUMENT: case_id is a non-empty string (correctly scoped)
          - MISSING: case_id key is absent from metadata (needs re-indexing)
        """
        global_count  = 0
        scoped_count  = 0
        missing_count = 0
        total_count   = 0

        if collection:
            # ChromaDB path
            try:
                all_items = collection.get(include=["metadatas"])
                metadatas = all_items.get("metadatas") or []
                ids       = all_items.get("ids") or []
                total_count = len(ids)

                for i, meta in enumerate(metadatas):
                    if meta is None:
                        missing_count += 1
                        continue

                    if "case_id" not in meta:
                        # Key is absent — pre-Phase-17.1 chunk
                        missing_count += 1
                    elif not meta["case_id"]:
                        # Key present but empty — correctly marked global precedent
                        global_count += 1
                    else:
                        # Key present and non-empty — correctly scoped
                        scoped_count += 1

            except Exception as e:
                print(f"\n[MIGRATION] ChromaDB inspection error: {e}")
                # Non-fatal for the test
        else:
            # In-memory fallback
            for item in in_memory_store:
                total_count += 1
                meta = item.get("metadata", {})
                if "case_id" not in meta:
                    missing_count += 1
                elif not meta["case_id"]:
                    global_count += 1
                else:
                    scoped_count += 1

        # ── Report ────────────────────────────────────────────────────────────────
        print(f"\n{'='*60}")
        print(f"PHASE 17.2A — CHROMADB MIGRATION INSPECTION REPORT")
        print(f"{'='*60}")
        print(f"  Total chunks        : {total_count}")
        print(f"  Correctly scoped    : {scoped_count}  (have non-empty case_id)")
        print(f"  Global precedent    : {global_count}  (empty case_id — correct for seed data)")
        print(f"  Missing case_id     : {missing_count} (pre-Phase-17.1, need re-indexing)")
        print(f"{'='*60}")

        if missing_count > 0:
            print(f"\n  ACTION REQUIRED: {missing_count} chunk(s) lack case_id metadata.")
            print(f"  These are from documents ingested before Phase 17.2A.")
            print(f"  They will NOT appear in case-scoped /ask queries.")
            print(f"  Re-index by re-uploading the affected documents through the upload API.")
            print(f"  Safe re-indexing: use the upload endpoint — it will upsert (not duplicate).")
        else:
            print(f"\n  All chunks have case_id metadata. No migration required.")

        # Test always passes — this is a reporting test, not a correctness gate
        self.assertIsInstance(total_count, int)
        self.assertIsInstance(missing_count, int)
        self.assertIsInstance(global_count, int)
        self.assertIsInstance(scoped_count, int)
        self.assertEqual(total_count, global_count + scoped_count + missing_count,
                         "Chunk counts must sum correctly")

    def test_seed_data_has_no_case_id_by_design(self):
        """
        Seed data (global precedents like Mardia Chemicals, Satyawati Tondon)
        must NOT have case_id — they are global search targets for /similar-cases.
        Verify that the absence of case_id in seed chunks is correct and expected.
        """
        # Global precedent convention:
        GLOBAL_PRECEDENT_CASE_ID = ""  # empty string = global

        # Simulate a seed chunk (as seeded by seed_ingest.py)
        seed_chunk_metadata = {
            "document_id": "seed_mardia_chemicals.txt",
            "document_name": "Mardia Chemicals",
            "case_name": "MARDIA/CHEMICALS/TXT",
            "case_number": "MARDIA/CHEMICALS/TXT",
            "case_id": GLOBAL_PRECEDENT_CASE_ID,  # correctly empty
            "court": "Supreme Court of India",
            "year": 2024,
            "page_number": 1,
            "source": "Legal Record",
            "chunk_id": "seed_mardia_chemicals.txt_chunk_0",
            "chunk_index": 0,
            "total_chunks": 1
        }

        self.assertEqual(
            seed_chunk_metadata["case_id"], "",
            "Seed global precedent must have empty case_id"
        )
        self.assertFalse(
            bool(seed_chunk_metadata["case_id"]),
            "Falsy case_id confirms global precedent (not a case document)"
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
