import re
from typing import Dict, List, Any

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

def extract_legal_entities(text: str) -> Dict[str, Any]:
    """
    Extracts structured legal entities using spaCy NER combined with rule-based regex
    for Indian legal documents (case numbers, IPC/BNS sections, courts, parties, judges).
    """
    entities = {
        "case_number": None,
        "court_name": None,
        "petitioner": None,
        "respondent": None,
        "judge_name": None,
        "legal_sections": [],
        "hearing_date": None,
        "witnesses": [],
        "people": [],
        "organizations": []
    }

    if not text:
        return entities

    # 1. Regex Layer for Case Number
    case_num_match = re.search(
        r'(?:Writ\s+Petition|WP|Special\s+Leave\s+Petition|SLP|Criminal\s+Appeal|Civil\s+Appeal|Crl\.A\.|CA|Suit\s+No\.)\s*(?:\([A-Za-z0-9\s-]+\))?\s*(?:No\.|\/)?\s*\d+[\/\-]\d{2,4}',
        text, re.IGNORECASE
    )
    if case_num_match:
        entities["case_number"] = case_num_match.group(0).strip()

    # 2. Regex Layer for Court Name
    court_match = re.search(
        r'(Supreme\s+Court\s+of\s+India|High\s+Court\s+of\s+[A-Za-z\s]+|District\s+and\s+Sessions\s+Court|Sessions\s+Court|Tribunal\s+[A-Za-z\s]+)',
        text, re.IGNORECASE
    )
    if court_match:
        entities["court_name"] = court_match.group(0).strip()
    else:
        entities["court_name"] = "Supreme Court of India"  # Default institutional context if unspecified

    # 3. Regex for Petitioner vs Respondent (X vs Y or X v. Y)
    vs_match = re.search(r'([A-Z][A-Za-z0-9\.\s,]+?)\s+(?:versus|vs\.?|v\.?)\s+([A-Z][A-Za-z0-9\.\s,]+)', text, re.IGNORECASE)
    if vs_match:
        entities["petitioner"] = vs_match.group(1).strip()
        entities["respondent"] = vs_match.group(2).split('\n')[0].strip()

    # 4. Regex for Judge Name
    judge_match = re.search(r'(?:Hon\'?ble\s+(?:Mr\.|Ms\.|Justice)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)|CORAM\s*:\s*([A-Za-z\.\s,]+))', text)
    if judge_match:
        entities["judge_name"] = (judge_match.group(1) or judge_match.group(2)).strip()

    # 5. Regex for Legal Sections & Acts (IPC, BNS, CrPC, BNSS, Constitution, etc.)
    sections = re.findall(
        r'(?:Section|Sec\.|Article|Art\.)\s*\d+(?:\(\d+\))?(?:\s*(?:of\s+the\s+)?(?:IPC|BNS|CrPC|BNSS|Indian\s+Penal\s+Code|Constitution|NI\s+Act|Evidence\s+Act|IT\s+Act))?',
        text, re.IGNORECASE
    )
    if sections:
        entities["legal_sections"] = list(set([s.strip() for s in sections]))

    # 6. Regex for Witnesses
    witnesses = re.findall(r'\b(?:PW|DW)-\d+\b|\bWitness\s+\d+:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)', text)
    if witnesses:
        entities["witnesses"] = list(set([w if isinstance(w, str) else w[0] for w in witnesses]))

    # 7. Regex for Hearing Date
    date_match = re.search(r'\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*,?\s*\d{4})\b', text, re.IGNORECASE)
    if date_match:
        entities["hearing_date"] = date_match.group(0).strip()

    # 8. spaCy NER Layer (if model loaded)
    if nlp:
        doc = nlp(text[:10000])  # limit to first 10k chars for performance
        people = set()
        orgs = set()
        for ent in doc.ents:
            if ent.label_ == "PERSON" and len(ent.text.strip()) > 3:
                people.add(ent.text.strip())
            elif ent.label_ in ["ORG", "GPE"] and len(ent.text.strip()) > 3:
                orgs.add(ent.text.strip())
        
        entities["people"] = list(people)[:10]
        entities["organizations"] = list(orgs)[:10]

    return entities
