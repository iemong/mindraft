# CLAUDE.md: プロジェクト固有のコンテキストとガイドライン

このファイルは、Claudeアシスタントがこのリポジトリで効率的に動作するために必要なコンテキストを提供します。会話を開始する際に自動的に読み込まれます。

**構成:** このリポジトリは Turborepo を使用したモノレポ構成です (`apps/*`, `packages/*`)。

簡潔かつ人間が読みやすいように記述してください。チームメンバーと共有するためにGitで管理することを推奨します (`CLAUDE.md`)。ローカル専用にする場合は `.gitignore` に追加し、`CLAUDE.local.md` という名前にします。

## 基本原則 (重要)

*   **不明点の質問:** 指示やコンテキストが不明確な場合、または複数の解釈が可能な場合は、**必ず質問して明確化してください**。推測で進めないでください。

## 共通のBashコマンド (ルートディレクトリで実行)

*   `bun run build`: プロジェクト全体をビルドします (`turbo run build`)。
*   `bun run dev`: 開発モードで起動します (`turbo run dev`)。
  * app (port:1420) sidecar-app (port:3001)
*   `bun run format`: Biome を使用してコードをフォーマットします (`biome check --write --unsafe .`)。
*   `bun run check-types`: TypeScript の型チェックを実行します (`turbo run check-types`)。
*   *（個別のパッケージ/アプリのコマンドは、それぞれのディレクトリで実行するか、`turbo run <script> --filter=<package-name>` のように実行）*

## コードスタイルガイドライン

*   **フォーマッター/リンター:** Biome (`biome.json` 参照)
*   ES Modules (`import`/`export`) 構文を使用し、CommonJS (`require`) は使用しません。
*   可能な場合は分割代入 (`import { foo } from 'bar'`) を使用します。
*   UI libraryは `shadcn/ui` を使用します。
*   スタイルは Tailwind CSS V4 を使用します。
*   アイコンは `lucide-react` を使用します。
*   componentをexportするときは、export default ではなく、export const でエクスポートします。

## 開発ワークフロー

*   一連のコード変更が完了したら、必ず型チェック (`bun run check-types`) を実行してください。
*   **マークアップ変更の確認:** UI (マークアップ) に変更を加えた場合は、Playwright を使用して `localhost:1420` にアクセスし、スクリーンショットを撮影して意図通りに表示されているか確認してください。
*   **Git Hooks:** Lefthook (`lefthook.yml` 参照) がコミット前にチェックを実行します。
*   パフォーマンスのため、テストスイート全体ではなく、個別のテストを実行することを推奨します。（テストコマンドは適宜追加してください）
*   ブランチ命名規則: `feature/xxx`, `fix/yyy` など。
*   マージ戦略: （例: Rebaseを推奨、Squash mergeを使用 など）
*   *（その他のテストの実行方法、環境設定、注意すべき予期せぬ動作などを追加）*

## TDD (テスト駆動開発) の進め方

*   **テスト先行:** まず失敗するテストケースを記述します。
*   **実装:** テストをパスする最小限のコードを実装します。
*   **リファクタリング:** テストをパスした状態でコードを改善します。
*   テストケースや実装に関する具体的な指示をClaudeに与えてください。

## その他

*   **重要なファイル/設定:**
    *   `turbo.json`: Turborepo の設定ファイル。
    *   `biome.json`: Biome の設定ファイル。
    *   `lefthook.yml`: Git フックの設定ファイル。
    *   *（`apps/` や `packages/` 内の重要なモジュールなどを追記）*
*   **開発環境:**
    *   **Node.js:** `22.13.0` (`.tool-versions` で管理)
    *   **パッケージマネージャー:** `bun@1.1.43` (`package.json` の `packageManager` 参照)
    *   **主要なツール:** Turborepo (`turbo`), Biome (`@biomejs/biome`), TypeScript (`typescript`)
    *   *（その他の必要なツール、依存関係など）*

## アプリケーション (`apps/`)

*   `app/`: Tauri アプリケーション (フロントエンド)。
    *   **目的:** mindraft エディタ機能を提供
    *   **主な機能:**
        - 左側にワークスペース内のファイルツリー & タグ検索サイドバー
        - 中央に Remirror (ProseMirror) ベースの WYSIWYG/Markdown ハイブリッドエディタ (折り畳み & フォーカスモード対応)
        - 右側に Vercel AI SDK を用いたチャットサイドバー (/chat, /summarize, JSON 出力)
        - 画像/動画のドラッグ&ドロップで `assets/` へコピー、自動 WebP 変換オプション付き
        - YAML front‑matter によるメタデータ・タグ管理
        - `mcp.json` 経由で外部 MCP サーバ管理 & Hono サイドカーと連携
*   `sidecar-app/`: `app` のサイドカーとして動作する Node.js サーバー。
    *   **技術スタック:** Hono (Web フレームワーク), TypeScript, tsx (実行), pkg (バイナリ化)
    *   **目的:** mindraft のローカルバックエンド API を提供し、AI チャットや URL Fetch などの処理を担う
    *   **主な機能:**
        - Hono ベースの HTTP サーバー (`/chat`, `/fetch` など) を提供
        - Vercel AI SDK を使ったチャット、要約、`generateObject` による構造化 JSON 出力
        - `mcp.json` の定義に基づく外部 MCP サーバ転送機能
        - Node.js（または Bun）で CLI 兼用実行が可能
        - 環境変数や Tauri 環境変数経由で API Key を受け取り、サーバー側で保持

---

**このファイルのチューニングについて:**

このファイルの内容はClaudeへのプロンプトの一部となります。内容を追加・変更した際は、その効果を確認し、Claudeが指示に従いやすくなるように調整してください。`#` キーを使ってClaudeに指示を出し、このファイルに追記させることも可能です。変更内容はコミットに含め、チームメンバーと共有しましょう。必要に応じて、「重要」「必須」などの強調表現を追加することも有効です。 
