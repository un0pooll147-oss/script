"use client";
import { useState, useRef } from "react";
import { Clapperboard, Loader2, RefreshCw, Copy, Check, FileText, FileDown } from "lucide-react";

const GENRES = ["ヒューマンドラマ", "恋愛", "サスペンス・ミステリー", "ホラー", "コメディ", "青春", "家族", "医療", "刑事・警察", "時代劇", "SF・ファンタジー"];
const TARGETS = ["一般", "10〜20代", "30〜40代", "50代以上", "女性向け", "男性向け", "ファミリー"];

export default function OrderTab() {
  const [form, setForm] = useState({
    genre: "ヒューマンドラマ",
    episodes: 1,
    target: "一般",
    theme: "",
    characters: "",
    synopsis: "",
    style_notes: "",
  });
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const scriptRef = useRef<HTMLDivElement>(null);

  const getTitle = () => {
    const match = script.match(/【タイトル】\s*(.+)/);
    return match ? match[1].trim() : "脚本";
  };

  const handleGenerate = async () => {
    if (!form.synopsis.trim()) { alert("あらすじを入力してください"); return; }
    setGenerating(true);
    setScript("");
    try {
      const res = await fetch("http://localhost:8000/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("生成に失敗しました");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              setScript(prev => prev + parsed.text);
              if (scriptRef.current) scriptRef.current.scrollTop = scriptRef.current.scrollHeight;
            } catch {}
          }
        }
      }
    } catch (e: any) { alert(e.message); }
    finally { setGenerating(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!script) return;
    setExporting(format);
    try {
      const res = await fetch("http://localhost:8000/api/export/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, title: getTitle(), format }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "エクスポートに失敗しました" }));
        throw new Error(err.detail);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${getTitle()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { alert(e.message); }
    finally { setExporting(null); }
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <div className="w-[400px] border-r border-ink-700 p-6 overflow-y-auto flex-shrink-0">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">GENRE</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map(g => (
                <button key={g} onClick={() => setForm(f => ({ ...f, genre: g }))}
                  className={`px-3 py-1.5 text-xs rounded border transition-all ${form.genre === g ? "border-gold-500 bg-gold-500/10 text-gold-300" : "border-ink-600 text-ink-300 hover:border-ink-400 hover:text-ink-100"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="gold-line" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">EPISODES</label>
              <input type="number" min={1} max={12} value={form.episodes}
                onChange={e => setForm(f => ({ ...f, episodes: parseInt(e.target.value) || 1 }))}
                className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm focus:border-gold-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">TARGET</label>
              <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm focus:border-gold-500 focus:outline-none">
                {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">THEME</label>
            <input type="text" placeholder="例: 孤独と再生、家族の絆、復讐と許し" value={form.theme}
              onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
              className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm placeholder-ink-500 focus:border-gold-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">CHARACTERS</label>
            <textarea rows={3} placeholder={"例:\n主人公: 田中恵（35歳・元刑事）\n相棒: 佐藤誠（28歳・新米刑事）"}
              value={form.characters} onChange={e => setForm(f => ({ ...f, characters: e.target.value }))}
              className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm placeholder-ink-500 focus:border-gold-500 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">SYNOPSIS <span className="text-crimson-400">*</span></label>
            <textarea rows={5} placeholder="あらすじ・プロットを入力してください（必須）"
              value={form.synopsis} onChange={e => setForm(f => ({ ...f, synopsis: e.target.value }))}
              className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm placeholder-ink-500 focus:border-gold-500 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-widest text-ink-300 mb-2">STYLE NOTES</label>
            <input type="text" placeholder="例: 静かな緊張感、セリフ少なめ、映画的な演出" value={form.style_notes}
              onChange={e => setForm(f => ({ ...f, style_notes: e.target.value }))}
              className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-ink-100 text-sm placeholder-ink-500 focus:border-gold-500 focus:outline-none" />
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 disabled:bg-ink-600 text-ink-950 font-display font-medium tracking-widest text-sm rounded transition-all duration-200 flex items-center justify-center gap-2">
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> 執筆中...</> : <><Clapperboard className="w-4 h-4" /> 脚本を生成する</>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-ink-700">
          <span className="text-xs font-mono tracking-widest text-ink-400">SCRIPT VIEWER</span>
          {script && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleGenerate} disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-ink-600 text-ink-300 hover:border-ink-400 hover:text-ink-100 rounded transition-all">
                <RefreshCw className="w-3 h-3" /> 再生成
              </button>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-ink-600 text-ink-300 hover:border-ink-400 hover:text-ink-100 rounded transition-all">
                {copied ? <Check className="w-3 h-3 text-gold-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "コピー済み" : "コピー"}
              </button>
              <button onClick={() => handleExport("pdf")} disabled={exporting !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-crimson-600 text-crimson-400 hover:bg-crimson-500/10 disabled:opacity-50 rounded transition-all">
                {exporting === "pdf" ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                PDF
              </button>
              <button onClick={() => handleExport("docx")} disabled={exporting !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gold-600 text-gold-400 hover:bg-gold-500/10 disabled:opacity-50 rounded transition-all">
                {exporting === "docx" ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
                Word
              </button>
            </div>
          )}
        </div>

        <div ref={scriptRef} className="flex-1 overflow-y-auto p-8">
          {!script && !generating && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Clapperboard className="w-16 h-16 text-ink-700 mb-4" />
              <p className="text-ink-500 font-display font-light tracking-wider">
                左のフォームからオーダーを入力し<br />脚本を生成してください
              </p>
            </div>
          )}
          {(script || generating) && (
            <div className="max-w-2xl mx-auto">
              <div className="script-viewer">{script}</div>
              {generating && <span className="inline-block w-0.5 h-4 bg-gold-400 animate-cursor-blink ml-0.5 align-middle" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
