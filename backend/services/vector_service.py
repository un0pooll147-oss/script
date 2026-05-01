import chromadb
from chromadb.utils import embedding_functions
import anthropic
import os
from typing import List

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "drama_scripts"

client = chromadb.PersistentClient(path=CHROMA_PATH)
openai_ef = embedding_functions.DefaultEmbeddingFunction()

def get_collection():
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=openai_ef,
    )

def add_script(script_id: str, text: str, metadata: dict):
    collection = get_collection()
    # 長い脚本はチャンク分割
    chunks = chunk_text(text, chunk_size=1000, overlap=100)
    ids = [f"{script_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{**metadata, "chunk_index": i, "script_id": script_id} for i in range(len(chunks))]
    collection.add(documents=chunks, ids=ids, metadatas=metadatas)
    return len(chunks)

def search_similar_scripts(query: str, n_results: int = 3) -> List[dict]:
    collection = get_collection()
    count = collection.count()
    if count == 0:
        return []
    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, count),
    )
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    return [{"text": d, "metadata": m} for d, m in zip(docs, metas)]

def get_all_scripts() -> List[dict]:
    collection = get_collection()
    if collection.count() == 0:
        return []
    results = collection.get()
    seen_ids = set()
    scripts = []
    for doc, meta in zip(results["documents"], results["metadatas"]):
        sid = meta.get("script_id", "")
        if sid not in seen_ids:
            seen_ids.add(sid)
            scripts.append({"script_id": sid, "title": meta.get("title", "無題"), "metadata": meta})
    return scripts

def delete_script(script_id: str):
    collection = get_collection()
    results = collection.get(where={"script_id": script_id})
    if results["ids"]:
        collection.delete(ids=results["ids"])

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks
