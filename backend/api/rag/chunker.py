"""
Phase 7: Structure-Aware Legal Chunker
======================================
Implements Statute-Aware and Judgment-Aware Chunking.
Preserves hierarchy (Act -> Chapter -> Section -> Sub-section) and paragraph numbers.
"""

import re
from typing import List, Dict, Any


def chunk_statute(text: str, default_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Structure-Aware Statute Chunking.
    Splits text by Section / Article / Chapter boundaries.
    Includes section title in chunk text and metadata.
    """
    if not text or not text.strip():
        return []

    # Regex for matching Section / Article boundaries
    pattern = r"(?=\n\s*(?:Section|Sec\.|Article|Art\.)\s+\d+)"
    raw_blocks = [b.strip() for b in re.split(pattern, text) if b.strip()]

    chunks = []
    chunk_index = 0

    for block in raw_blocks:
        # Extract section number and title
        match = re.search(r"^(?:Section|Sec\.|Article|Art\.)\s+(\d+[A-Z]*)\.?\s*([^\n]+)?", block, re.IGNORECASE)
        section_no = match.group(1) if match else default_metadata.get("section", "")
        section_title = match.group(2).strip() if (match and match.group(2)) else ""

        # Extract Chapter if present
        chap_match = re.search(r"CHAPTER\s+([I|V|X|L|C|D|M|\d]+)", block, re.IGNORECASE)
        chapter_no = chap_match.group(0) if chap_match else default_metadata.get("chapter", "")

        chunk_meta = dict(default_metadata)
        chunk_meta["document_type"] = "STATUTE"
        chunk_meta["section"] = f"Section {section_no}" if section_no and not section_no.lower().startswith("section") else section_no
        if chapter_no:
            chunk_meta["chapter"] = chapter_no
        chunk_meta["chunk_index"] = chunk_index

        chunks.append({
            "text": block,
            "metadata": chunk_meta
        })
        chunk_index += 1

    # Fallback to standard chunking if no section headings detected
    if not chunks:
        return fallback_chunk_text(text, default_metadata)

    return chunks


def chunk_judgment(text: str, default_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Paragraph-Aware Judgment Chunking.
    Preserves paragraph numbers (e.g. Paragraph 1, Paragraph 2) and court details.
    """
    if not text or not text.strip():
        return []

    # Split by numbered paragraphs (e.g., "\n1. ", "\n[1] ", "\nParagraph 1:")
    para_pattern = r"(?=\n\s*(?:\[?\d+\]?\.?|Paragraph\s+\d+:?)\s+)"
    raw_paras = [p.strip() for p in re.split(para_pattern, text) if p.strip()]

    chunks = []
    chunk_index = 0

    for block in raw_paras:
        # Extract paragraph number if present
        para_match = re.search(r"^(?:\[?(\d+)\]?\.?|Paragraph\s+(\d+):?)", block, re.IGNORECASE)
        para_num = para_match.group(1) or para_match.group(2) if para_match else str(chunk_index + 1)

        chunk_meta = dict(default_metadata)
        chunk_meta["document_type"] = "JUDGMENT"
        chunk_meta["paragraph_number"] = str(para_num)
        chunk_meta["chunk_index"] = chunk_index

        chunks.append({
            "text": block,
            "metadata": chunk_meta
        })
        chunk_index += 1

    if not chunks:
        return fallback_chunk_text(text, default_metadata)

    return chunks


def fallback_chunk_text(text: str, default_metadata: Dict[str, Any], chunk_size: int = 1800, overlap: int = 300) -> List[Dict[str, Any]]:
    """
    Standard sliding window chunker for general legal documents.
    """
    chunks = []
    if not text or not text.strip():
        return chunks

    start = 0
    text_len = len(text)
    chunk_index = 0

    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk_str = text[start:end].strip()
        if chunk_str:
            meta = dict(default_metadata)
            meta["chunk_index"] = chunk_index
            chunks.append({
                "text": chunk_str,
                "metadata": meta
            })
            chunk_index += 1

        if end >= text_len:
            break
        start += (chunk_size - overlap)

    return chunks


def chunk_legal_document(text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Dispatches document to structure-aware chunker based on document_type.
    """
    doc_type = (metadata.get("document_type") or "").upper()
    if doc_type == "STATUTE" or "act" in metadata.get("title", "").lower() or "code" in metadata.get("title", "").lower():
        return chunk_statute(text, metadata)
    elif doc_type == "JUDGMENT" or "v." in text.lower() or "vs." in text.lower():
        return chunk_judgment(text, metadata)
    else:
        return fallback_chunk_text(text, metadata)
