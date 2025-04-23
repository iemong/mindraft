import type { WorkspaceInfo } from "@/types/workspace";
import { invoke } from "@tauri-apps/api/core";

export const saveFile = (filePath: string, content: string) =>
	invoke("save_file", {
		filePath,
		content,
	});

export const openFile = (filePath: string) =>
	invoke<string>("open_file", {
		filePath,
	});

export const loadWorkspace = (workspacePath: string) =>
	invoke<WorkspaceInfo>("load_workspace", {
		workspacePath,
	});
