# mindraft — 現行技術スタック（2025‑04 時点）
 
## コア
- **Tauri v2 (Rust)** — デスクトップシェル／ウインドウ管理  
- **React 18 + Tailwind CSS + Vite** — レンダラ UI／ホットリロード  
- **turborepo + bun** — モノレポ管理・タスクグラフ  
- **LeftHook** — Git フック（pre‑commit で Biome 実行）  
- **Biome** — 静的解析 & フォーマッタ（`biome check/format`）
 
## バックエンド / MCP
- **Hono (TypeScript)** — 軽量 HTTP ルータ  
- **Bun 1.x** — Hono サイドカー実行ランタイム  
- **Vercel AI SDK** — OpenAI/Groq など LLM 呼び出し  
- **mcps/** ディレクトリ — URL Fetch・PDF 解析などツール群  
  - `hono-server/` … `/chat`, `/fetch` など API 実装  
  - 各 MCP は CLI として単体実行も可能
 
## エディタ機能
- **Remirror (ProseMirror)** — WYSIWYG・Markdown ハイブリッド編集／折り畳み対応  
- **YAML front‑matter** — タグ・メタデータ管理  
- 画像/動画ドラッグ時に **sharp‑wasm** で自動 WebP 変換（任意）
 
## テスト・CI
- **Vitest** — ユニットテスト  
- **GitHub Actions** — `turbo run lint build test` + Remote Turbo Cache  
- **LeftHook** — ステージングファイルのみ Biome 実行
 
## 配布
- **Tauri CLI** — macOS `.app`, Windows `.msi`, Linux `.AppImage` 生成  
- 将来: `electron-updater` 同等の Auto‑Update を検討