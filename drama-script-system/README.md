# SCRIPT FORGE — セットアップ手順

## 必要なもの
- Python 3.10 以上
- Node.js 18 以上
- Anthropic API Key（https://console.anthropic.com）

---

## 1. バックエンドのセットアップ

```bash
cd backend

# 仮想環境を作成
python -m venv venv
source venv/bin/activate      # Mac/Linux
# venv\Scripts\activate       # Windows

# パッケージインストール
pip install -r requirements.txt

# APIキーを環境変数に設定
export ANTHROPIC_API_KEY="sk-ant-xxxx..."   # Mac/Linux
# set ANTHROPIC_API_KEY=sk-ant-xxxx...      # Windows

# サーバー起動
uvicorn main:app --reload --port 8000
```

→ http://localhost:8000 で確認

---

## 2. フロントエンドのセットアップ

```bash
cd frontend

# パッケージインストール
npm install

# 開発サーバー起動
npm run dev
```

→ http://localhost:3000 でアプリが開きます

---

## 使い方

### Step 1: 脚本をアップロード
「脚本アップロード」タブ → ファイルをドラッグ or テキスト貼り付け → タイトル入力 → 登録

### Step 2: 脚本を生成
「脚本オーダー」タブ → ジャンル・あらすじ等を入力 → 「脚本を生成する」

### Step 3: 確認・エクスポート
生成された脚本をビューアで確認 → コピーまたはダウンロード

---

## ファイル構成

```
drama-script-system/
├── backend/
│   ├── main.py                  # FastAPIエントリポイント
│   ├── requirements.txt
│   ├── routers/
│   │   ├── upload.py            # ファイルアップロードAPI
│   │   ├── scripts.py           # 脚本一覧・削除API
│   │   └── generate.py          # 脚本生成API（ストリーミング）
│   ├── services/
│   │   ├── vector_service.py    # ChromaDB操作
│   │   └── generate_service.py  # Claude API + RAG
│   └── chroma_db/               # ← 自動生成されるDBファイル
└── frontend/
    ├── src/app/
    │   ├── page.tsx             # メインページ
    │   ├── layout.tsx
    │   └── globals.css
    └── src/components/
        ├── OrderTab.tsx         # 脚本オーダーUI
        ├── UploadTab.tsx        # アップロードUI
        └── LibraryTab.tsx       # ライブラリUI
```
