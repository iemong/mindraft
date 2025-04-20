import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import "./style.css";
import { listen } from "@tauri-apps/api/event";
import { Toaster, toast } from "sonner";
import WorkspaceDialog from "./components/dialogs/WorkspaceDialog";

interface WorkspaceInfo {
	path: string;
	files: string[];
}

function App() {
	const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(true);
	const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
	const [currentFile, setCurrentFile] = useState<string | null>(null);
	const [fileContent, setFileContent] = useState<string>("");
	const [isEdited, setIsEdited] = useState(false);
	const autoSaveTimerRef = useRef<number | null>(null);

	// キーボードショートカットの登録
	useEffect(() => {
		const handleKeyDown = async (event: KeyboardEvent) => {
			// Cmd/Ctrl+S で保存
			if ((event.metaKey || event.ctrlKey) && event.key === "s") {
				event.preventDefault();
				if (currentFile) {
					await saveFile();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentFile]);

	// 自動保存タイマーのセットアップ
	useEffect(() => {
		// 変更があり、かつファイルが開かれている場合のみタイマーを設定
		if (isEdited && currentFile) {
			// 既存のタイマーをクリア
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}

			// 30秒後に自動保存
			autoSaveTimerRef.current = window.setTimeout(async () => {
				await saveFile();
				// トースト通知
				toast.success("Auto-saved");
			}, 30000);
		}

		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}
		};
	}, [isEdited, currentFile]);

	// ワークスペースが読み込まれたときのハンドラ
	const handleWorkspaceLoaded = (loadedWorkspace: WorkspaceInfo) => {
		setWorkspace(loadedWorkspace);
		console.log("Workspace loaded:", loadedWorkspace);
	};

	// ファイルを開くハンドラ
	const handleOpenFile = async (filePath: string) => {
		try {
			// 未保存の変更がある場合、確認
			if (isEdited && currentFile) {
				const confirmed = window.confirm(
					"You have unsaved changes. Do you want to save them before opening a new file?",
				);
				if (confirmed) {
					await saveFile();
				}
				setIsEdited(false);
			}

			const content = await invoke<string>("open_file", { filePath });
			setCurrentFile(filePath);
			setFileContent(content);
		} catch (err) {
			console.error("Failed to open file:", err);
			toast.error(`Failed to open file: ${err}`);
		}
	};

	// ファイル内容の変更ハンドラ
	const handleContentChange = (content: string) => {
		setFileContent(content);
		setIsEdited(true);
	};

	// ファイル保存の処理
	const saveFile = async () => {
		if (!currentFile) return;

		try {
			await invoke("save_file", {
				filePath: currentFile,
				content: fileContent,
			});
			setIsEdited(false);
			toast.success("File saved successfully");
			return true;
		} catch (err) {
			console.error("Failed to save file:", err);
			toast.error(`Failed to save file: ${err}`);
			return false;
		}
	};

	// フォーカスを失った時に自動保存
	const handleBlur = async () => {
		if (isEdited && currentFile) {
			await saveFile();
		}
	};

	return (
		<div className="flex flex-col h-screen">
			{/* トースト通知 */}
			<Toaster position="top-right" />

			{/* ワークスペース選択ダイアログ */}
			<WorkspaceDialog
				open={workspaceDialogOpen}
				onOpenChange={setWorkspaceDialogOpen}
				onWorkspaceLoaded={handleWorkspaceLoaded}
			/>

			{workspace ? (
				<div className="flex flex-1 overflow-hidden">
					{/* 左サイドバー: ファイルツリー */}
					<div className="w-64 bg-gray-100 p-4 overflow-y-auto">
						<h2 className="text-lg font-semibold mb-2">Files</h2>
						<div className="space-y-1">
							{workspace.files.map((file) => (
								<button
									type="button"
									key={file}
									className={`p-2 rounded-md cursor-pointer hover:bg-gray-200 ${
										currentFile === file ? "bg-gray-200" : ""
									}`}
									onClick={() => handleOpenFile(file)}
								>
									{file.split("/").pop()}
								</button>
							))}
						</div>
					</div>

					{/* メインコンテンツ: エディタ領域 */}
					<div className="flex-1 overflow-auto">
						{currentFile ? (
							<div className="p-4">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-lg font-semibold">
										{currentFile.split("/").pop()}
										{isEdited && <span className="text-gray-500 ml-2">*</span>}
									</h2>
									<button
										type="button"
										onClick={saveFile}
										className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
										disabled={!isEdited}
									>
										Save
									</button>
								</div>
								<div
									className="border rounded-md p-4 min-h-[500px]"
									onBlur={handleBlur}
								>
									{/* ここに Remirror エディタを実装する予定 */}
									<textarea
										className="w-full h-full min-h-[500px] focus:outline-none"
										value={fileContent}
										onChange={(e) => handleContentChange(e.target.value)}
									/>
								</div>
							</div>
						) : (
							<div className="h-full flex items-center justify-center text-gray-500">
								Select a file to edit
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-semibold mb-2">
							No Workspace Selected
						</h2>
						<p className="text-gray-600 mb-4">
							Select a workspace to start editing your Markdown files
						</p>
						<button
							type="button"
							onClick={() => setWorkspaceDialogOpen(true)}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
						>
							Select Workspace
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
