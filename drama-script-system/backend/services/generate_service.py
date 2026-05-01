import anthropic
import os
from services.vector_service import search_similar_scripts

claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def generate_script(order: dict) -> str:
    genre = order.get("genre", "ドラマ")
    episodes = order.get("episodes", 1)
    theme = order.get("theme", "")
    characters = order.get("characters", "")
    synopsis = order.get("synopsis", "")
    style_notes = order.get("style_notes", "")
    target = order.get("target", "一般")

    # RAG: 類似脚本を検索
    query = f"{genre} {theme} {synopsis}"
    similar = search_similar_scripts(query, n_results=3)

    reference_text = ""
    if similar:
        reference_text = "\n\n## 参考脚本（過去作品より）\n"
        for i, s in enumerate(similar, 1):
            reference_text += f"\n### 参考{i}（{s['metadata'].get('title','無題')}より）\n"
            reference_text += s["text"][:600] + "...\n"

    prompt = f"""あなたはプロの脚本家です。以下のオーダーに従って、バズる・感情を揺さぶる高品質なドラマ脚本を書いてください。

## オーダー内容
- ジャンル: {genre}
- 話数: {episodes}話
- ターゲット: {target}
- テーマ・メッセージ: {theme}
- 登場人物: {characters}
- あらすじ・プロット: {synopsis}
- スタイル・トーン指定: {style_notes}
{reference_text}

## 脚本執筆ルール
1. 冒頭シーンは必ず視聴者の心を掴むフックから始める
2. セリフは自然で感情がにじむものにする（説明的にならない）
3. 各シーンに明確な目的を持たせる
4. 伏線と回収を意識した構成にする
5. 参考脚本がある場合はそのトーン・文体・演出スタイルを参考にする

## 出力形式
【タイトル】
【あらすじ】（200字以内）
【登場人物】
【第1話 脚本】
　シーン1: ...（場所・状況）
　（セリフ・ト書き）
　...

では脚本を書いてください。"""

    message = claude.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text
