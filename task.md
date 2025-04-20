# エディタ機能MVP：詳細開発タスク

## 0. ワークスペース選択ダイアログ
    1.	ダイアログ呼び出し
          •	@tauri-apps/api/dialog.open({ directory: true }) を使い、フォルダ選択
    2.	設定保存／読み込み
          •	選択結果を Tauri のストア（tauri-plugin-store）に workspacePath として保存
          •	アプリ起動時にキーを読み出し、存在すれば即 loadWorkspace(path) を呼ぶ
    3.	エラー & キャンセル対応
          •	ユーザーがキャンセルした場合は再度プロンプト or アプリ終了ダイアログ
          •	フォルダ権限エラー時に警告トースト

## ファイル入出力
    1.	ファイル一覧取得
          •	fs.readDir(workspacePath) で .md ファイル一覧を取得
          •	assets/ サブフォルダの存在確認・作成
    2.	ファイルオープン
          •	サイドバーのクリックイベントで core/fs.openFile(path) を呼び出し
          •	読み込んだ文字列をエディタにセット
    3.	手動保存
          •	Cmd/Ctrl+S イベントハンドラを設置 → core/fs.saveFile(path, content)
    4.	自動保存
          •	onBlur フック実装 → save
          •	30秒インターバルで setInterval → save
    5.	保存成功/失敗通知
          •	保存完了時にトースト、「失敗: ファイルがロック中」などはエラーダイアログ

## 2. Remirror ベースのエディタコア
    1.	パッケージ導入
          •	@remirror/react, @remirror/pm 等インストール
          •	Tailwind で基本スタイルを当てる
    2.	エディタ初期化
          •	<RemirrorProvider manager={…} initialContent={markdownToDoc(md)} /> を実装
          •	Markdown ↔ ProseMirror ドキュメント変換ユーティリティの組み込み
    3.	折り畳み機能
          •	見出しノードに折り畳みマークを付与するカスタムノード or トグルプラグイン
    4.	フォーカスモード
          •	広告用プラグイン：選択行以外に CSS クラス（opacity-30）を付与
          •	トグルスイッチ UI の実装
    5.	シンタックスハイライト
          •	remirror/extensions の SyntaxHighlightExtension を有効化
          •	プリセットテーマ or Tailwind テーマ変数へのマッピング

## 3. YAML front‑matter 管理
    1.	Parser 組み込み
          •	gray-matter でフロントマター抽出・更新
    2.	UIコンポーネント
          •	ドキュメント上部に「メタデータ編集モード」パネルを実装
          •	タグは複数選択可能なチップ UI（shadcn/ui の Chip）
    3.	同期
          •	編集完了時に front‑matter と本文を一緒に再マージして保存

## 4. 検索 & 置換
    1.	検索バー UI
          •	モーダル or 左サイドバー内に Input + “次を検索”/“前を検索” ボタン
    2.	インクリメンタル検索
          •	入力ごとにエディタ内 doc.textBetween をスキャン → マッチ箇所をハイライト
    3.	置換機能
          •	範囲 or 全文置換ダイアログ実装（検索結果リスト ＆ 置換テキスト入力）
          •	確認 → remirror.state.tr.replaceRange で書き換え

## 5. 画像・動画の埋め込み（基礎版）
    1.	ドラッグ＆ドロップ検知
          •	エディタコンテナに onDrop イベントハンドラを追加
          •	DataTransferItem からファイル取得
    2.	ファイルコピー
          •	@tauri-apps/api/fs.writeFile で workspacePath/assets/yyyy-mm-dd-<uuid>.<ext> に保存
    3.	Markdown 生成
          •	ファイル保存完了後にカーソル位置へ ![alt](assets/...) または <video> タグを挿入
    4.	プレビュー確認
          •	Remirror 内プレビュー or サイドプレビューで動作チェック