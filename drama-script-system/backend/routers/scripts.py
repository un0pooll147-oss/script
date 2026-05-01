from fastapi import APIRouter, HTTPException
from services.vector_service import get_all_scripts, delete_script

router = APIRouter()

@router.get("/")
def list_scripts():
    scripts = get_all_scripts()
    return {"scripts": scripts, "count": len(scripts)}

@router.delete("/{script_id}")
def remove_script(script_id: str):
    try:
        delete_script(script_id)
        return {"success": True, "script_id": script_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
