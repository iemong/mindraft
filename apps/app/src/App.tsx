import { useState } from "react";
import "./style.css";
import { AppSideBar } from "./components/app-side-bar";
import { EditorSection } from "./components/editor-section";
import { Empty } from "./components/empty/empty";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { WorkspaceDialog } from "./components/workspace-dialog";
import { WorkspaceSelector } from "./components/workspace-selector";
import { useEditorContext } from "./components/editor/context/editor-context";
import { useError } from "./hooks/use-error";
import { openFile, saveFile } from "./lib/commands";
import type { WorkspaceInfo } from "./types/workspace";

export const App = () => {
	const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(true);
	const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
	const { showError } = useError();

	// エディタコンテキストから状態を取得
	const {
		currentFile,
		setCurrentFile,
		fileContent,
		setFileContent,
		initialContent,
		setInitialContent,
		isEdited,
		setIsEdited,
	} = useEditorContext();

	// ワークスペースが読み込まれたときのハンドラ
	const handleWorkspaceLoaded = (loadedWorkspace: WorkspaceInfo) => {
		setWorkspaceDialogOpen(false);
		setWorkspace(loadedWorkspace);
		setCurrentFile(null);
		setFileContent("");
		setInitialContent("");
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
			setInitialContent(content);
			setIsEdited(false);
		} catch (err) {
			showError(`Failed to open file: ${err}`);
		}
	};

	console.log(isEdited);

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
						{currentFile ? <EditorSection key={currentFile} /> : <Empty />}
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
