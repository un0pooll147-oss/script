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

# ★ 既存のキャッシュがある場合はクリーンインストール
rm -rf node_modules .next   # Mac/Linux
# rmdir /s /q node_modules .next   # Windows

# パッケージインストール
npm install

# 開発サーバー起動
npm run dev
```

→ http://localhost:3000 でアプリが開きます

---

## トラブルシューティング

### ページを開いたら404になる
1. `node_modules` と `.next` を削除して `npm install` をやり直す
2. バックエンド（ポート8000）も起動しているか確認
3. `npm run dev` を実行したターミナルにエラーが出ていないか確認

### バックエンドに接続できない（CORS/Network Error）
- バックエンドを先に起動してからフロントを起動する
- `uvicorn main:app --reload --port 8000` が動いているか確認

### PDF出力で文字化けする
- Linux環境の場合: `sudo apt install fonts-noto-cjk` でフォントを追加
- Mac環境では自動的にシステムフォントが使われます

---

## 使い方

### Step 1: 脚本をアップロード
「脚本アップロード」タブ → ファイルをドラッグ or テキスト貼り付け → タイトル入力 → 登録

### Step 2: 脚本を生成
「脚本オーダー」タブ → ジャンル・あらすじ等を入力 → 「脚本を生成する」

### Step 3: エクスポート
生成された脚本をビューアで確認 → PDF / Word ボタンでダウンロード

---

## ファイル構成

```
drama-script-system/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── upload.py
│   │   ├── scripts.py
│   │   ├── generate.py
│   │   └── export.py        ← PDF/Word出力
│   ├── services/
│   │   ├── vector_service.py
│   │   └── generate_service.py
│   └── chroma_db/           ← 自動生成
└── frontend/
    ├── tsconfig.json        ← 必須
    ├── next.config.js
    ├── package.json
    ├── src/app/
    │   ├── page.tsx
    │   ├── layout.tsx
    │   └── globals.css
    └── src/components/
        ├── OrderTab.tsx
        ├── UploadTab.tsx
        └── LibraryTab.tsx
```
