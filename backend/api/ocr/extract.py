import fitz  # PyMuPDF
import io
from PIL import Image

try:
    import pytesseract
except ImportError:
    pytesseract = None

def extract_text_from_file(file_bytes: bytes, filename: str) -> dict:
    """
    Extracts text from PDF or image files using PyMuPDF first for native PDFs,
    falling back to pytesseract OCR for scanned documents or images.
    """
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    
    if ext == 'pdf':
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            extracted_text = ""
            for page in doc:
                text = page.get_text()
                if text:
                    extracted_text += text + "\n"
            
            extracted_text = extracted_text.strip()
            if len(extracted_text) >= 30:
                return {
                    "raw_text": extracted_text,
                    "source": "native_pdf",
                    "page_count": len(doc),
                    "success": True
                }
            
            # If native text is insufficient, try OCR on page images
            if pytesseract is not None:
                ocr_text = ""
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    pix = page.get_pixmap(dpi=150)
                    img = Image.open(io.BytesIO(pix.tobytes()))
                    ocr_text += pytesseract.image_to_string(img) + "\n"
                
                ocr_text = ocr_text.strip()
                if ocr_text:
                    return {
                        "raw_text": ocr_text,
                        "source": "ocr",
                        "page_count": len(doc),
                        "success": True
                    }
        except Exception as e:
            return {
                "error": f"Failed to process PDF: {str(e)}",
                "success": False
            }

    # Image files (jpg, png, tiff, etc.)
    elif ext in ['png', 'jpg', 'jpeg', 'bmp', 'tiff']:
        if pytesseract is not None:
            try:
                img = Image.open(io.BytesIO(file_bytes))
                ocr_text = pytesseract.image_to_string(img).strip()
                if ocr_text:
                    return {
                        "raw_text": ocr_text,
                        "source": "ocr",
                        "page_count": 1,
                        "success": True
                    }
            except Exception as e:
                return {
                    "error": f"Failed to run OCR on image: {str(e)}",
                    "success": False
                }
        else:
            return {
                "error": "OCR engine (pytesseract) is not installed on the system.",
                "success": False
            }
            
    # Plain text files
    elif ext in ['txt', 'md']:
        try:
            text = file_bytes.decode('utf-8', errors='ignore').strip()
            return {
                "raw_text": text,
                "source": "plain_text",
                "page_count": 1,
                "success": True
            }
        except Exception as e:
            return {
                "error": f"Failed to read text file: {str(e)}",
                "success": False
            }

    return {
        "error": "Low-confidence/Empty OCR output or unsupported file type.",
        "success": False
    }
