# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## アーキテクチャ概要

**Mindraft** は AI アシスタント機能を備えた Tauri ベースのマークダウンエディタで、Turborepo モノレポとして構築されています。

- **app/**: React フロントエンドを備えた Tauri デスクトップアプリケーション
  - Lexical ベースのマークダウンエディタ（リアルタイムプレビュー付き）
  - ワークスペース管理機能付きファイルツリーナビゲーション
  - Vercel AI SDK を活用した AI チャットサイドバー
  - メタデータとタグ用の YAML フロントマター
  - WebP 変換機能付きメディアドラッグ＆ドロップ
  
- **sidecar-app/**: Node.js バックエンドサーバー（Hono フレームワーク）
  - AI チャット API エンドポイントを提供
  - OpenAI 統合を処理
  - 開発時はポート 3001 で実行
  - Tauri アプリと一緒に配布するためバイナリとしてパッケージ化

## 共通コマンド

### ルートディレクトリコマンド
- `bun run dev` - 両方のアプリを開発モードで起動（app: ポート 1420、sidecar: ポート 3001）
- `bun run build` - すべてのアプリをビルド
- `bun run format` - Biome でコードをフォーマット
- `bun run check-types` - TypeScript の型チェックを実行
- `bun run test` - すべてのテストを実行
- `bun run test:watch` - ウォッチモードでテストを実行
- `bun run test:coverage` - カバレッジ付きでテストを実行

### アプリ別コマンド
- `bun run dev --filter=app` - Tauri アプリのみを実行
- `bun run dev --filter=sidecar-app` - サイドカーサーバーのみを実行
- `cd apps/app && bun run tauri dev` - Tauri を開発モードで実行
- `cd apps/sidecar-app && bun run pkg` - サイドカーバイナリをビルド

## コードスタイルガイドライン

- **フォーマッター/リンター:** Biome（`biome.json` 参照）
  - タブインデント
  - 文字列にはダブルクォート
  - 自動インポート整理
- ES モジュール（`import`/`export`）を使用、CommonJS は不使用
- 分割代入を優先: `import { foo } from 'bar'`
- UI コンポーネント: shadcn/ui
- スタイリング: Tailwind CSS v4
- アイコン: lucide-react
- コンポーネントは名前付きエクスポートで: `export const Component`、`export default` は使用しない

## 開発ワークフロー

1. **コード変更後:** `bun run check-types` を実行して型安全性を確保
2. **UI 検証:** マークアップ変更後は Playwright で `localhost:1420` のスクリーンショットを撮影
3. **Git フック:** Lefthook がプリコミット時に Biome フォーマッターを実行
4. **テスト:** 
   - ブラウザモード（Playwright/Chromium）で Vitest を使用
   - より速いフィードバックのため特定のテストを実行
   - テストファイルは `.test.ts` または `.test.tsx` 拡張子を使用

## 主要ファイルと設定

- `turbo.json` - Turborepo パイプライン設定
- `biome.json` - コードフォーマットとリンティングルール
- `lefthook.yml` - Git フック設定
- `apps/app/src-tauri/tauri.conf.json` - Tauri アプリ設定
- `apps/app/components.json` - shadcn/ui コンポーネント設定
- `.tool-versions` - Node.js バージョン（22.13.0）

## 開発環境

- **Node.js:** 22.13.0（.tool-versions で管理）
- **パッケージマネージャー:** Bun 1.1.43
- **主要ツール:**
  - モノレポ管理用 Turborepo
  - フォーマット/リンティング用 Biome
  - TypeScript（ルート 5.8.2、アプリ 5.6.2）
  - テスト用 Vitest
  - デスクトップアプリフレームワーク用 Tauri

## コンポーネント構造（app/）

### 主要コンポーネント
- `AppSideBar` - ファイルツリーナビゲーションとワークスペース管理
- `ChatSideBar` - ストリーミングレスポンス付き AI チャットインターフェース
- `EditorSection` - メインエディタコンテナ
- `Editor` - プラグイン付き Lexical ベースのマークダウンエディタ
- `WorkspaceDialog` - ワークスペースの選択と作成

### 状態管理
- ファイル状態は Tauri コマンドを通じて管理
- エディタ状態は Lexical と React コンテキストで管理
- ワークスペース状態はファイルシステムに永続化

### Tauri コマンド（`lib/commands.ts` 内）
- ファイル操作: `readTextFile`、`writeTextFile`、`readDir`
- ワークスペース管理: `selectFolder`、`getWorkspacePath`
- プロセス管理: `startApiServer`、`stopApiServer`

## API エンドポイント（sidecar-app/）

- `GET /health` - ヘルスチェック
- `POST /chat` - AI チャットエンドポイント（レスポンスをストリーム）
  - 期待値: `{ messages: Array<{role: string, content: string}> }`
  - 戻り値: Server-sent events ストリーム