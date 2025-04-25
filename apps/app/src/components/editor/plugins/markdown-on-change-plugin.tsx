import { $convertToMarkdownString } from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";
import { TRANSFORMERS } from "../config/editor-config";

type MarkdownOnChangePluginProps = {
	onMarkdownChange: (markdown: string) => void;
};

export const MarkdownOnChangePlugin = ({
	onMarkdownChange,
}: MarkdownOnChangePluginProps) => {
	const handleOnChange = (editorState: EditorState) => {
		editorState.read(() => {
			const markdown = $convertToMarkdownString(TRANSFORMERS);
			onMarkdownChange(markdown);
		});
	};
	return <OnChangePlugin onChange={handleOnChange} />;
};
