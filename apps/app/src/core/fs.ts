import { fs, path } from "@tauri-apps/api";

export const loadWorkspace = async (workspacePath: string) => {
	try {
		// ディレクトリが存在するか確認
		const dirExists = await fs.exists(workspacePath);
		if (!dirExists) {
			throw new Error("Workspace directory does not exist");
		}

		// assets フォルダの確認と作成
		const assetsPath = await path.join(workspacePath, "assets");
		const assetsExists = await fs.exists(assetsPath);
		if (!assetsExists) {
			await fs.createDir(assetsPath);
		}

		// .md ファイル一覧を取得
		const entries = await fs.readDir(workspacePath);
		const mdFiles = entries
			.filter((entry) => entry.name?.endsWith(".md"))
			.map((entry) => entry.path);

		return {
			path: workspacePath,
			files: mdFiles,
		};
	} catch (error) {
		console.error("Failed to load workspace:", error);
		throw error;
	}
};

export const openFile = async (filePath: string) => {
	try {
		const content = await fs.readTextFile(filePath);
		return content;
	} catch (error) {
		console.error("Failed to open file:", error);
		throw error;
	}
};

export const saveFile = async (filePath: string, content: string) => {
	try {
		await fs.writeTextFile(filePath, content);
		return true;
	} catch (error) {
		console.error("Failed to save file:", error);
		throw error;
	}
};
