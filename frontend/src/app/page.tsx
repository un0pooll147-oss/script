"use client";
import { useState } from "react";
import OrderTab from "@/components/OrderTab";
import UploadTab from "@/components/UploadTab";
import LibraryTab from "@/components/LibraryTab";

type Tab = "order" | "upload" | "library";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("order");

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* ヘッダー */}
      <header className="relative border-b border-ink-700 px-8 py-5 film-holes">
        <div className="ml-8 mr-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-light tracking-[0.3em] text-gold-400">
                SCRIPT FORGE
              </h1>
              <p className="text-ink-300 text-xs tracking-widest mt-0.5">
                ドラマ脚本生成システム
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse inline-block" />
              SYSTEM ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* タブナビ */}
      <nav className="border-b border-ink-700 px-16">
        <div className="flex gap-0">
          {[
            { key: "order", label: "脚本オーダー", sub: "GENERATE" },
            { key: "upload", label: "脚本アップロード", sub: "UPLOAD" },
            { key: "library", label: "ナレッジ一覧", sub: "LIBRARY" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`
                relative px-8 py-4 text-sm transition-all duration-200 group
                ${activeTab === tab.key
                  ? "text-gold-400 border-b-2 border-gold-500"
                  : "text-ink-300 hover:text-ink-100 border-b-2 border-transparent"
                }
              `}
            >
              <span className="font-mono text-[10px] tracking-widest block mb-0.5 opacity-60">
                {tab.sub}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* コンテンツ */}
      <main className="flex-1 overflow-auto">
        {activeTab === "order" && <OrderTab />}
        {activeTab === "upload" && <UploadTab />}
        {activeTab === "library" && <LibraryTab />}
      </main>
    </div>
  );
}
