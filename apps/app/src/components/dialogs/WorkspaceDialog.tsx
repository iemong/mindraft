import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

// FileSystemNode を App.tsx からインポートするか、ここで再定義
type FileSystemNode =
	| {
			type: "File";
			name: string;
			path: string;
	  }
	| {
			type: "Directory";
			name: string;
			path: string;
			children: FileSystemNode[];
	  };

// WorkspaceInfo を App.tsx からインポートするか、ここで再定義
interface WorkspaceInfo {
	path: string;
	tree: FileSystemNode[];
}

interface WorkspaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onWorkspaceLoaded: (workspace: WorkspaceInfo) => void;
}

/**
 * ワークスペース選択ダイアログコンポーネント
 * アプリケーション起動時にワークスペースフォルダを選択するためのダイアログを表示
 */
export const WorkspaceDialog = ({
	open,
	onOpenChange,
	onWorkspaceLoaded,
}: WorkspaceDialogProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * 保存されたワークスペースを読み込む
	 */
	useEffect(() => {
		// 起動時にストアから保存されたワークスペースパスを読み込み
		const checkStoredWorkspace = async () => {
			try {
				const store = await load("mindraft.json", { autoSave: true });
				const storedPath = await store.get<string>("workspacePath");

				if (storedPath) {
					await loadWorkspace(storedPath);
					// ワークスペースが正常に読み込まれたらダイアログを閉じる
					onOpenChange(false);
				}
			} catch (err) {
				console.error("保存されたワークスペースを確認できませんでした:", err);
				// エラーがあってもダイアログは開いたまま
			}
		};

		if (open) {
			checkStoredWorkspace();
		}
	}, [open, onOpenChange]);

	/**
	 * フォルダ選択ダイアログを開く
	 */
	const openFolderDialog = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Tauriのダイアログを表示
			const selected = await openDialog({
				directory: true,
				multiple: false,
				title: "ワークスペースフォルダを選択",
			});

			if (selected === null) {
				// ユーザーがダイアログをキャンセルした場合
				setError(
					"フォルダが選択されていません。続行するにはワークスペースフォルダを選択してください。",
				);
			} else if (!Array.isArray(selected)) {
				// 単一のディレクトリが選択された場合
				await loadWorkspace(selected);
				// 成功したらダイアログを閉じる
				onOpenChange(false);
			}
		} catch (err) {
			handleError(err, "フォルダ選択ダイアログを開けませんでした。");
		} finally {
			setIsLoading(false);
		}
	}, [onOpenChange]);

	/**
	 * ワークスペースを読み込む
	 */
	const loadWorkspace = useCallback(
		async (path: string) => {
			try {
				setIsLoading(true);
				setError(null);

				// Rustコマンドを呼び出してワークスペースを読み込み
				const workspaceInfo = await invoke<WorkspaceInfo>("load_workspace", {
					workspacePath: path,
				});
				// ワークスペースパスをストアに保存
				const store = await load("mindraft.json", { autoSave: true });
				await store.set("workspacePath", path);
				await store.save();

				// 親コンポーネントに通知
				onWorkspaceLoaded(workspaceInfo);
			} catch (err: unknown) {
				console.error("Failed to load workspace:", err);
				let errorMessage = "An unknown error occurred";
				if (typeof err === "string") {
					errorMessage = err;
				} else if (err instanceof Error) {
					errorMessage = err.message;
				} else {
					try {
						errorMessage = JSON.stringify(err);
					} catch {
						errorMessage = "Failed to stringify error object";
					}
				}
				setError(`Failed to load workspace: ${errorMessage}`);
			} finally {
				setIsLoading(false);
			}
		},
		[onWorkspaceLoaded],
	);

	/**
	 * エラーハンドリング共通処理
	 */
	const handleError = (err: unknown, baseMessage: string) => {
		console.error(baseMessage, err);
		let errorMessage = baseMessage;

		if (err instanceof Error) {
			errorMessage += ` ${err.message}`;
		}

		setError(`${errorMessage} もう一度お試しください。`);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>ワークスペースを選択</DialogTitle>
					<DialogDescription>
						Mindraftワークスペースとして使用するフォルダを選択してください。
						すべてのMarkdownファイルはここに保存されます。
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="p-3 bg-red-100 text-red-700 rounded-md mt-2">
						{error}
					</div>
				)}

				<DialogFooter className="mt-4">
					<button
						type="button"
						className="flex justify-center items-center gap-2 w-full px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors disabled:opacity-50 disabled:bg-blue-500"
						onClick={openFolderDialog}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<span className="animate-spin">⏳</span>
								読み込み中...
							</>
						) : (
							"フォルダを選択"
						)}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default WorkspaceDialog;
