import { saveFile } from "@/lib/commands";
import { Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Editor } from "../editor";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

type EditorSectionProps = {
	currentFile: string;
	initialContent: string;
	isEdited: boolean;
	onContentChange: (content: string) => void;
	onSaveComplete?: () => void;
};

export const EditorSection = ({
	currentFile,
	initialContent,
	isEdited,
	onContentChange,
	onSaveComplete,
}: EditorSectionProps) => {
	const [content, setContent] = useState(initialContent);
	const autoSaveTimerRef = useRef<number | null>(null);

	useEffect(() => {
		setContent(initialContent);
	}, [initialContent]);

	const handleMarkdownChange = useCallback(
		(markdown: string) => {
			setContent(markdown);
			onContentChange(markdown);
		},
		[onContentChange],
	);

	const handleSave = useCallback(async () => {
		try {
			await saveFile(currentFile, content);
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
				autoSaveTimerRef.current = null;
			}
			toast.success("File saved successfully");
			onSaveComplete?.();
		} catch (err) {
			console.error("Failed to save file:", err);
			toast.error(`Failed to save file: ${err}`);
		}
	}, [currentFile, content, onSaveComplete]);

	useEffect(() => {
		const handleKeyDown = async (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "s") {
				event.preventDefault();
				if (isEdited) {
					await handleSave();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isEdited, handleSave]);

	useEffect(() => {
		if (isEdited) {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}
			autoSaveTimerRef.current = window.setTimeout(async () => {
				await handleSave();
				toast.success("Auto-saved");
			}, 30000);
		}

		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}
		};
	}, [isEdited, handleSave]);

	const handleBlur = useCallback(async () => {
		if (isEdited) {
			await handleSave();
		}
	}, [isEdited, handleSave]);

	return (
		<div className="h-full flex flex-col p-4">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold truncate" title={currentFile}>
					{currentFile.split(/[\/\\]/).pop()}
					{isEdited && <span className="text-muted-foreground ml-2">*</span>}
				</h2>
				<Button
					variant="secondary"
					size="sm"
					onClick={handleSave}
					disabled={!isEdited}
				>
					<Save className="h-4 w-4 mr-2" />
					保存
				</Button>
			</div>
			<Separator className="mb-4" />
			<div className="flex-1 overflow-auto" onBlur={handleBlur}>
				<Editor
					initialMarkdown={initialContent}
					onMarkdownChange={handleMarkdownChange}
				/>
			</div>
		</div>
	);
};
