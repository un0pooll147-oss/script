"use client";
import { useState, useEffect } from "react";
import { BookOpen, Trash2, RefreshCw, Loader2, Database } from "lucide-react";

interface Script {
  script_id: string;
  title: string;
  metadata: { genre?: string; notes?: string; filename?: string };
}

export default function LibraryTab() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/scripts/");
      const data = await res.json();
      setScripts(data.scripts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScripts(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」をナレッジから削除しますか？`)) return;
    setDeleting(id);
    try {
      await fetch(`http://localhost:8000/api/scripts/${id}`, { method: "DELETE" });
      setScripts(prev => prev.filter(s => s.script_id !== id));
    } catch (e) {
      alert("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-light tracking-[0.2em] text-gold-300 mb-1">ナレッジライブラリ</h2>
          <p className="text-xs text-ink-400">登録済み脚本 — {scripts.length}本</p>
        </div>
        <button
          onClick={fetchScripts}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-ink-600 text-ink-300 hover:border-ink-400 rounded transition-all"
        >
          <RefreshCw className="w-3 h-3" /> 更新
        </button>
      </div>

      <div className="gold-line" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
        </div>
      ) : scripts.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Database className="w-12 h-12 text-ink-700 mx-auto" />
          <p className="text-ink-500 font-display font-light tracking-wider">
            まだ脚本が登録されていません
          </p>
          <p className="text-ink-600 text-sm">「脚本アップロード」タブから登録してください</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scripts.map((s, i) => (
            <div
              key={s.script_id}
              className="flex items-center gap-4 p-4 bg-ink-800 border border-ink-700 rounded-lg hover:border-ink-500 transition-all group animate-slide-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
            >
              <BookOpen className="w-5 h-5 text-gold-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-ink-100 font-medium truncate">{s.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {s.metadata.genre && (
                    <span className="text-xs text-gold-600 font-mono">{s.metadata.genre}</span>
                  )}
                  {s.metadata.notes && (
                    <span className="text-xs text-ink-500 truncate">{s.metadata.notes}</span>
                  )}
                  {s.metadata.filename && (
                    <span className="text-xs text-ink-600 truncate">{s.metadata.filename}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(s.script_id, s.title)}
                disabled={deleting === s.script_id}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-ink-500 hover:text-crimson-400 transition-all"
              >
                {deleting === s.script_id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
