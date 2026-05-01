from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.vector_service import add_script
import uuid
import io

router = APIRouter()

def extract_text(file: UploadFile) -> str:
    content = file.file.read()
    filename = file.filename.lower()

    if filename.endswith(".txt") or filename.endswith(".md"):
        return content.decode("utf-8", errors="ignore")

    elif filename.endswith(".pdf"):
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages)
        except ImportError:
            raise HTTPException(status_code=400, detail="pdfplumberが未インストールです: pip install pdfplumber")

    elif filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs)
        except ImportError:
            raise HTTPException(status_code=400, detail="python-docxが未インストールです: pip install python-docx")

    else:
        raise HTTPException(status_code=400, detail="対応ファイル形式: .txt, .md, .pdf, .docx")

@router.post("/")
async def upload_script(
    file: UploadFile = File(...),
    title: str = Form(...),
    genre: str = Form(default="ドラマ"),
    notes: str = Form(default=""),
):
    try:
        text = extract_text(file)
        if len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="テキストが短すぎます")

        script_id = str(uuid.uuid4())
        metadata = {
            "title": title,
            "genre": genre,
            "notes": notes,
            "filename": file.filename,
        }
        chunks = add_script(script_id, text, metadata)
        return {
            "success": True,
            "script_id": script_id,
            "title": title,
            "chunks": chunks,
            "chars": len(text),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text")
async def upload_text(
    title: str = Form(...),
    text: str = Form(...),
    genre: str = Form(default="ドラマ"),
    notes: str = Form(default=""),
):
    if len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="テキストが短すぎます")
    script_id = str(uuid.uuid4())
    metadata = {"title": title, "genre": genre, "notes": notes, "filename": "manual_input"}
    chunks = add_script(script_id, text, metadata)
    return {"success": True, "script_id": script_id, "title": title, "chunks": chunks, "chars": len(text)}
