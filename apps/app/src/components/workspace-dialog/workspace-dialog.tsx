import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

import { useError } from "@/hooks/use-error";
import { loadWorkspace } from "@/lib/commands";
import type { WorkspaceInfo } from "@/types/workspace";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

type WorkspaceDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onWorkspaceLoaded: (workspace: WorkspaceInfo) => void;
};

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
	const { showError } = useError();
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
					await handleLoadWorkspace(storedPath);
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

			// Tauriのダイアログを表示
			const selected = await openDialog({
				directory: true,
				multiple: false,
				title: "ワークスペースフォルダを選択",
			});

			if (selected === null) {
				// ユーザーがダイアログをキャンセルした場合
				throw new Error(
					"フォルダが選択されていません。続行するにはワークスペースフォルダを選択してください。",
				);
			}
			if (!Array.isArray(selected)) {
				// 単一のディレクトリが選択された場合
				await handleLoadWorkspace(selected);
				// 成功したらダイアログを閉じる
				onOpenChange(false);
			}
		} catch (err: unknown) {
			showError(
				err instanceof Error
					? err.message
					: "フォルダ選択ダイアログを開けませんでした。",
			);
		} finally {
			setIsLoading(false);
		}
	}, [onOpenChange, showError]);

	/**
	 * ワークスペースを読み込む
	 */
	const handleLoadWorkspace = useCallback(
		async (path: string) => {
			try {
				setIsLoading(true);

				// Rustコマンドを呼び出してワークスペースを読み込み
				const workspaceInfo = await loadWorkspace(path);
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
				showError(`Failed to load workspace: ${errorMessage}`);
			} finally {
				setIsLoading(false);
			}
		},
		[onWorkspaceLoaded, showError],
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>ワークスペースを選択</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					Mindraftワークスペースとして使用するフォルダを選択してください。
					すべてのMarkdownファイルはここに保存されます。
				</DialogDescription>
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
