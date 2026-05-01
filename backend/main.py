from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import scripts, upload, generate, export

app = FastAPI(title="Drama Script System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(scripts.router, prefix="/api/scripts", tags=["scripts"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(export.router, prefix="/api/export", tags=["export"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Drama Script System API"}
