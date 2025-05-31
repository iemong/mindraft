import { createContext, useContext, useState } from "react";

type EditorContextType = {
	// エディタ内部の状態
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
	lastSavedMarkdown: string;
	setLastSavedMarkdown: (markdown: string) => void;

	// ファイル管理の状態
	currentFile: string | null;
	setCurrentFile: (file: string | null) => void;
	fileContent: string;
	setFileContent: (content: string) => void;
	initialContent: string;
	setInitialContent: (content: string) => void;
	isEdited: boolean;
	setIsEdited: (isEdited: boolean) => void;

	// ファイル変更ハンドラ
	handleContentChange: (content: string) => void;
	handleSaveComplete: () => void;

	// エディタへのコンテンツ追加
	appendToEditor: (content: string) => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
	// エディタ内部の状態
	const [isEditing, setIsEditing] = useState(false);
	const [lastSavedMarkdown, setLastSavedMarkdown] = useState("");

	// ファイル管理の状態
	const [currentFile, setCurrentFile] = useState<string | null>(null);
	const [fileContent, setFileContent] = useState<string>("");
	const [initialContent, setInitialContent] = useState<string>("");
	const [isEdited, setIsEdited] = useState(false);

	// ファイル変更ハンドラ
	const handleContentChange = (content: string) => {
		setFileContent(content);
		setIsEdited(content !== initialContent);
	};

	// ファイル保存完了ハンドラ
	const handleSaveComplete = () => {
		setInitialContent(fileContent);
		setIsEdited(false);
	};

	// エディタへのコンテンツ追加
	const appendToEditor = (content: string) => {
		const newContent = fileContent ? `${fileContent}\n\n${content}` : content;
		handleContentChange(newContent);
	};

	return (
		<EditorContext.Provider
			value={{
				// エディタ内部の状態
				isEditing,
				setIsEditing,
				lastSavedMarkdown,
				setLastSavedMarkdown,

				// ファイル管理の状態
				currentFile,
				setCurrentFile,
				fileContent,
				setFileContent,
				initialContent,
				setInitialContent,
				isEdited,
				setIsEdited,

				// ファイル変更ハンドラ
				handleContentChange,
				handleSaveComplete,
				appendToEditor,
			}}
		>
			{children}
		</EditorContext.Provider>
	);
}

export function useEditorContext() {
	const context = useContext(EditorContext);
	if (context === undefined) {
		throw new Error("useEditorContext must be used within an EditorProvider");
	}
	return context;
}
