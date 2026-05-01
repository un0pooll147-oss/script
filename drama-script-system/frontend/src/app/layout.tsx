import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCRIPT FORGE — ドラマ脚本生成システム",
  description: "AIによる高品質ドラマ脚本量産システム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
