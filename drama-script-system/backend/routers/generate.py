from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.generate_service import generate_script
import anthropic
import os
import json

router = APIRouter()

class ScriptOrder(BaseModel):
    genre: str = "ヒューマンドラマ"
    episodes: int = 1
    theme: str = ""
    characters: str = ""
    synopsis: str = ""
    style_notes: str = ""
    target: str = "一般"

@router.post("/")
def generate(order: ScriptOrder):
    try:
        result = generate_script(order.dict())
        return {"success": True, "script": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
async def generate_stream(order: ScriptOrder):
    claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    from services.vector_service import search_similar_scripts
    query = f"{order.genre} {order.theme} {order.synopsis}"
    similar = search_similar_scripts(query, n_results=3)

    reference_text = ""
    if similar:
        reference_text = "\n\n## 参考脚本（過去作品より）\n"
        for i, s in enumerate(similar, 1):
            reference_text += f"\n### 参考{i}（{s['metadata'].get('title','無題')}より）\n"
            reference_text += s["text"][:600] + "...\n"

    prompt = f"""あなたはプロの脚本家です。バズる・感情を揺さぶる高品質なドラマ脚本を書いてください。

## オーダー
- ジャンル: {order.genre}
- 話数: {order.episodes}話
- ターゲット: {order.target}
- テーマ: {order.theme}
- 登場人物: {order.characters}
- あらすじ: {order.synopsis}
- スタイル指定: {order.style_notes}
{reference_text}

冒頭は必ず視聴者を引き込むフックから。自然なセリフ、感情のにじむ演出で書いてください。

【タイトル】
【あらすじ】
【登場人物】
【第1話 脚本】"""

    def stream_generator():
        with claude.messages.stream(
            model="claude-opus-4-5",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")
