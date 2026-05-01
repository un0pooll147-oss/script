"use client";
import { useState, useCallback } from "react";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";

export default function UploadTab() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("ヒューマンドラマ");
  const [notes, setNotes] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/, "")); }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/, "")); }
  };

  const handleUpload = async () => {
    if (!title.trim()) { alert("タイトルを入力してください"); return; }
    setUploading(true);
    setResult(null);

    try {
      if (pasteMode) {
        if (!pasteText.trim()) { alert("テキストを入力してください"); return; }
        const fd = new FormData();
        fd.append("title", title);
        fd.append("text", pasteText);
        fd.append("genre", genre);
        fd.append("notes", notes);
        const res = await fetch("http://localhost:8000/api/upload/text", { method: "POST", body: fd });
        const data = await res.json();
        if (data.success) {
          setResult({ success: true, message: `「${data.title}」を登録しました（${data.chars}文字 / ${data.chunks}チャンク）` });
          setPasteText(""); setTitle(""); setNotes("");
        } else {
          setResult({ success: false, message: data.detail || "登録に失敗しました" });
        }
      } else {
        if (!file) { alert("ファイルを選択してください"); return; }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title);
        fd.append("genre", genre);
        fd.append("notes", notes);
        const res = await fetch("http://localhost:8000/api/upload/", { method: "POST", body: fd });
        const data = await res.json();
        if (data.success) {
          setResult({ success: true, message: `「${data.title}」を登録しました（${data.chars}文字 / ${data.chunks}チャンク）` });
          setFile(null); setTitle(""); setNotes("");
        } else {
          setResult({ success: false, message: data.detail || "登録に失敗しました" });
        }
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-light tracking-[0.2em] text-gold-300 mb-1">脚本をアップロード</h2>
        <p className="text-xs text-ink-400 tracking-wide">対応形式: .txt / .md / .pdf / .docx / テキスト貼り付け</p>
      </div>

      {/* モード切替 */}
      <div className="flex gap-0 border border-ink-600 rounded overflow-hidden w-fit">
        <button
          onClick={() => setPasteMode(false)}
          className={`px-4 py-2 text-sm transition-all ${!pasteMode ? "bg-gold-500/20 text-gold-300" : "text-ink-400 hover:text-ink-200"}`}
        >
          ファイル
        </button>
        <button
          onClick={() => setPasteMode(true)}
          className={`px-4 py-2 text-sm transition-all ${pasteMode ? "bg-gold-500/20 text-gold-300" : "text-ink-400 hover:text-ink-200"}`}
        >
          テキスト貼り付け
        </button>
      </div>

      {!pasteMode ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
            dragging ? "border-gold-500 bg-gold-500/5" : "border-ink-600 hover:border-ink-400"
          }`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input id="file-input" type="file" className="hidden" accept=".txt,.md,.pdf,.docx" onChange={handleFileChange} />
          {file ? (
            <div className="space-y-2">
              <FileText className="w-10 h-10 text-gold-400 mx-auto" />
              <p className="text-gold-300 font-medium">{file.name}</p>
              <p className="text-ink-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 text-ink-500 mx-auto" />
              <p className="text-ink-300">ファイルをドラッグ&ドロップ</p>
              <p className="text-ink-500 text-sm">またはクリックして選択</p>
            </div>
          )}
        </div>
      ) : (
        <textarea
          rows={10}
          placeholder="脚本テキストをここに貼り付けてください..."
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
          className="w-full bg-ink-800 border border-ink-600 rounded-lg px-4 py-3 text-ink-100 text-sm placeholder-ink-500 focus:border-gold-500 focus:outline-none resize-none font-mono"
        />
      )}

      {/* メタデータ */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">TITLE <span className="text-crimson-400">*</span></label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="脚本タイトルを入力"
            className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm placeholder-ink-500 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">GENRE</label>
            <input
              type="text"
              value={genre}
              onChange={e => setGenre(e.target.value)}
              className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">NOTES</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="メモ（任意）"
              className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm placeholder-ink-500 focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {result && (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${result.success ? "border-gold-600 bg-gold-500/5 text-gold-300" : "border-crimson-600 bg-crimson-500/5 text-crimson-400"}`}>
          {result.success ? <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span className="text-sm">{result.message}</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 disabled:bg-ink-600 text-ink-950 font-display font-medium tracking-widest text-sm rounded transition-all flex items-center justify-center gap-2"
      >
        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> 登録中...</> : <><Upload className="w-4 h-4" /> ナレッジに登録</>}
      </button>
    </div>
  );
}
