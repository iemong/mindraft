import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import "./style.css";
import { File as FileIcon, LayoutDashboard, Save } from "lucide-react";
import { Toaster, toast } from "sonner";
import WorkspaceDialog from "./components/dialogs/WorkspaceDialog";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "./components/ui/sidebar";

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
				<SidebarProvider>
					{/* 左サイドバー: ファイルツリー */}
					<Sidebar>
						<SidebarHeader className="px-6 py-3">
							<h2 className="text-lg font-semibold">ファイル</h2>
						</SidebarHeader>
						<SidebarContent>
							<SidebarMenu>
								{workspace.files.map((file) => {
									const fileName = file.split("/").pop() || "";
									return (
										<SidebarMenuItem key={file}>
											<SidebarMenuButton
												isActive={currentFile === file}
												onClick={() => handleOpenFile(file)}
											>
												<FileIcon className="mr-2 h-4 w-4" />
												<span>{fileName}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarContent>
					</Sidebar>
					<SidebarInset>
						{/* メインコンテンツ: エディタ領域 */}
						{currentFile ? (
							<div className="h-full flex flex-col p-4">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-lg font-semibold">
										{currentFile.split("/").pop()}
										{isEdited && (
											<span className="text-muted-foreground ml-2">*</span>
										)}
									</h2>
									<Button
										variant="secondary"
										size="sm"
										onClick={saveFile}
										disabled={!isEdited}
									>
										<Save className="h-4 w-4 mr-2" />
										保存
									</Button>
								</div>
								<Separator className="mb-4" />
								<div
									className="flex-1 border rounded-md p-4 overflow-auto"
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
							<div className="h-full flex items-center justify-center text-muted-foreground">
								<div className="text-center">
									<LayoutDashboard className="mx-auto h-8 w-8 mb-2" />
									<p>ファイルを選択してください</p>
								</div>
							</div>
						)}
					</SidebarInset>
				</SidebarProvider>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-semibold mb-2">
							ワークスペースが選択されていません
						</h2>
						<p className="text-muted-foreground mb-4">
							Markdownファイルを編集するためのワークスペースを選択してください
						</p>
						<Button onClick={() => setWorkspaceDialogOpen(true)}>
							ワークスペースを選択
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
