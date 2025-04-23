import { useState } from "react";
import "./style.css";
import { WorkspaceDialog } from "./components/workspace-dialog";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AppSideBar } from "./components/app-side-bar";
import type { WorkspaceInfo } from "./types/workspace";
import { Empty } from "./components/empty/empty";
import { Editor } from "./components/editor";
import { WorkspaceSelector } from "./components/workspace-selector";
import { openFile, saveFile } from "./lib/commands";
import { useError } from "./hooks/use-error";

export const App = () => {
	const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(true);
	const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
	const [currentFile, setCurrentFile] = useState<string | null>(null);
	const [fileContent, setFileContent] = useState<string>("");
	const [isEdited, setIsEdited] = useState(false);
	const { showError } = useError();

	// ワークスペースが読み込まれたときのハンドラ
	const handleWorkspaceLoaded = (loadedWorkspace: WorkspaceInfo) => {
		setWorkspaceDialogOpen(false);
		setWorkspace(loadedWorkspace);
		setCurrentFile(null);
		setFileContent("");
		setIsEdited(false);
		console.log("Workspace loaded:", loadedWorkspace);
	};

	// ファイルを開くハンドラ
	const handleOpenFile = async (filePath: string) => {
		if (filePath === currentFile) {
			return;
		}
		try {
			// 未保存の変更がある場合、保存するか確認
			if (isEdited && currentFile) {
				const confirmed = window.confirm(
					"You have unsaved changes. Do you want to save them before opening a new file?",
				);
				if (confirmed) {
					await saveFile(currentFile, fileContent);
				}
			}

			const content = await openFile(filePath);
			setCurrentFile(filePath);
			setFileContent(content);
			setIsEdited(false);
		} catch (err) {
			showError(`Failed to open file: ${err}`);
		}
	};

	// ファイル内容の変更ハンドラ
	const handleContentChange = (content: string) => {
		setFileContent(content);
		setIsEdited(true);
	};

	return (
		<div className="flex flex-col h-screen">
			{/* ワークスペース選択ダイアログ */}
			<WorkspaceDialog
				open={workspaceDialogOpen}
				onOpenChange={setWorkspaceDialogOpen}
				onWorkspaceLoaded={handleWorkspaceLoaded}
			/>

			{workspace ? (
				<SidebarProvider>
					{/* 左サイドバー: ファイルツリー */}
					<AppSideBar
						workspace={workspace}
						handleOpenFile={handleOpenFile}
						currentFile={currentFile}
					/>
					<SidebarInset>
						{/* メインコンテンツ: エディタ領域 */}
						{currentFile ? (
							<Editor
								key={currentFile}
								currentFile={currentFile}
								initialContent={fileContent}
								onContentChange={handleContentChange}
								isEdited={isEdited}
								setIsEdited={setIsEdited}
							/>
						) : (
							<Empty />
						)}
					</SidebarInset>
				</SidebarProvider>
			) : (
				<WorkspaceSelector
					onWorkspaceSelected={() => setWorkspaceDialogOpen(true)}
				/>
			)}
		</div>
	);
};
