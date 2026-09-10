"""
Phase 7: Authoritative Legal Corpus Metadata & Provenance Schema
================================================================
Defines collections, authority hierarchy, currentness statuses, and metadata contract.
"""

from enum import Enum
from typing import Dict, Any, Optional
import hashlib
import datetime


class LegalCorpusType(str, Enum):
    GLOBAL_CONSTITUTION = "GLOBAL_CONSTITUTION"
    GLOBAL_STATUTES = "GLOBAL_STATUTES"
    GLOBAL_RULES = "GLOBAL_RULES"
    GLOBAL_PRECEDENTS = "GLOBAL_PRECEDENTS"
    GLOBAL_PROCEDURE = "GLOBAL_PROCEDURE"
    LEGAL_DEFINITIONS = "LEGAL_DEFINITIONS"
    CASE_SCOPED = "CASE_SCOPED"


class AuthorityLevel(int, Enum):
    LEVEL_1_CONSTITUTION_SUPREME_COURT_STATUTES = 1
    LEVEL_2_HIGH_COURT_GOVT_RULES = 2
    LEVEL_3_GOVT_DEPARTMENT_LEGAL = 3
    LEVEL_4_TRUSTED_SECONDARY_LEGAL = 4
    LEVEL_5_GENERAL_REFERENCE = 5


class CurrentnessStatus(str, Enum):
    IN_FORCE = "IN_FORCE"
    REPEALED = "REPEALED"
    SUPERSEDED = "SUPERSEDED"
    HISTORICAL = "HISTORICAL"
    PARTIALLY_IN_FORCE = "PARTIALLY_IN_FORCE"
    CURRENTNESS_UNVERIFIED = "CURRENTNESS_UNVERIFIED"
    UNKNOWN = "UNKNOWN"


def compute_content_hash(text: str) -> str:
    """Computes SHA-256 hash of text content for duplicate detection and document integrity."""
    if not text:
        return ""
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


def normalize_metadata(input_meta: Dict[str, Any], text_content: str = "") -> Dict[str, Any]:
    """
    Normalizes metadata to adhere strictly to the Phase 7 Source Provenance Contract.
    Uses null / empty defaults for absent fields without inventing placeholder facts.
    """
    doc_id = input_meta.get("document_id") or input_meta.get("doc_id") or f"doc_{hashlib.md5((text_content[:200] + str(datetime.datetime.now())).encode()).hexdigest()[:10]}"
    doc_type = input_meta.get("document_type") or ("CASE_DOCUMENT" if input_meta.get("case_id") else "STATUTE")

    corpus = input_meta.get("corpus") or (LegalCorpusType.CASE_SCOPED.value if input_meta.get("case_id") else LegalCorpusType.GLOBAL_STATUTES.value)
    authority_level = int(input_meta.get("authority_level") or (1 if corpus != LegalCorpusType.CASE_SCOPED.value else 2))

    return {
        "document_id": str(doc_id),
        "document_type": str(doc_type),
        "title": input_meta.get("title") or input_meta.get("document_name") or "Legal Document",
        "citation": input_meta.get("citation") or input_meta.get("case_number") or "",
        "source_url": input_meta.get("source_url") or "",
        "source_name": input_meta.get("source_name") or input_meta.get("source") or "Official Legal Repository",
        "authority_level": authority_level,
        "jurisdiction": input_meta.get("jurisdiction") or "India",
        "court": input_meta.get("court") or ("Supreme Court of India" if doc_type == "JUDGMENT" else ""),
        "act": input_meta.get("act") or "",
        "section": input_meta.get("section") or "",
        "chapter": input_meta.get("chapter") or "",
        "rule": input_meta.get("rule") or "",
        "year": int(input_meta.get("year") or 2026),
        "judgment_date": input_meta.get("judgment_date") or "",
        "effective_date": input_meta.get("effective_date") or "",
        "repeal_date": input_meta.get("repeal_date") or "",
        "amendment_date": input_meta.get("amendment_date") or "",
        "status": input_meta.get("status") or CurrentnessStatus.IN_FORCE.value,
        "language": input_meta.get("language") or "en",
        "page_number": int(input_meta.get("page_number") or 1),
        "paragraph_number": input_meta.get("paragraph_number") or "",
        "case_id": input_meta.get("case_id") or "",
        "corpus": str(corpus),
        "ingestion_date": input_meta.get("ingestion_date") or datetime.date.today().isoformat(),
        "content_hash": input_meta.get("content_hash") or compute_content_hash(text_content),
        "version": input_meta.get("version") or "1.0",

        # Legacy backward-compatibility mappings
        "document_name": input_meta.get("title") or input_meta.get("document_name") or "Legal Document",
        "case_name": input_meta.get("title") or input_meta.get("case_name") or "Legal Precedent",
        "case_number": input_meta.get("citation") or input_meta.get("case_number") or ""
    }


def calculate_metadata_completeness(meta: Dict[str, Any]) -> float:
    """Calculates metadata completeness score (0.0 to 1.0) based on required key presence."""
    core_keys = [
        "document_id", "document_type", "title", "citation", "source_url",
        "source_name", "authority_level", "jurisdiction", "status", "corpus", "content_hash"
    ]
    present = sum(1 for k in core_keys if meta.get(k) is not None and str(meta.get(k)).strip() != "")
    return round(present / len(core_keys), 2)
