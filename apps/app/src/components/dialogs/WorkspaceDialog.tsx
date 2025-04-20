import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/api/dialog";
import { useEffect, useState } from "react";
import { Store } from "tauri-plugin-store";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

// ストアの初期化
const store = new Store("mindraft.json");

interface WorkspaceInfo {
	path: string;
	files: string[];
}

interface WorkspaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onWorkspaceLoaded: (workspace: WorkspaceInfo) => void;
}

export const WorkspaceDialog = ({
	open,
	onOpenChange,
	onWorkspaceLoaded,
}: WorkspaceDialogProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// 起動時にストアから保存されたワークスペースパスを読み込み
		const checkStoredWorkspace = async () => {
			try {
				const storedPath = await store.get<string>("workspacePath");

				if (storedPath) {
					await loadWorkspace(storedPath);
					// ワークスペースが正常に読み込まれたらダイアログを閉じる
					onOpenChange(false);
				}
			} catch (err) {
				console.error("Failed to check stored workspace:", err);
				// エラーがあってもダイアログは開いたまま
			}
		};

		if (open) {
			checkStoredWorkspace();
		}
	}, [open, onOpenChange]);

	const openFolderDialog = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// フォルダ選択ダイアログを表示
			const selected = await open({
				directory: true,
				multiple: false,
				title: "Select Workspace Folder",
			});

			if (selected && !Array.isArray(selected)) {
				await loadWorkspace(selected);
				// 成功したらダイアログを閉じる
				onOpenChange(false);
			} else {
				// ユーザーがキャンセルした場合
				setError(
					"No folder selected. Please select a workspace folder to continue.",
				);
			}
		} catch (err) {
			console.error("Failed to open folder dialog:", err);
			setError("Failed to open folder dialog. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const loadWorkspace = async (path: string) => {
		try {
			setIsLoading(true);
			setError(null);

			// Rustコマンドを呼び出してワークスペースを読み込み
			const workspace = await invoke<WorkspaceInfo>("load_workspace", {
				workspacePath: path,
			});

			// ワークスペースパスをストアに保存
			await store.set("workspacePath", path);
			await store.save();

			// 親コンポーネントに通知
			onWorkspaceLoaded(workspace);
		} catch (err) {
			console.error("Failed to load workspace:", err);
			setError(`Failed to load workspace: ${err}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Select Workspace</DialogTitle>
					<DialogDescription>
						Select a folder to use as your Mindraft workspace. All your Markdown
						files will be stored here.
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
						onClick={openFolderDialog}
						disabled={isLoading}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
					>
						{isLoading ? "Loading..." : "Select Folder"}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default WorkspaceDialog;
