import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export function EditorUpdaterPlugin({ markdown }: { markdown: string }) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		editor.update(() => {
			$convertFromMarkdownString(markdown, TRANSFORMERS);
		});
	}, [editor, markdown]);

	return null;
}
