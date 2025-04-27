import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { useEditorContext } from "../context/editor-context";

export function EditorUpdaterPlugin({ markdown }: { markdown: string }) {
	const [editor] = useLexicalComposerContext();
	const initialRenderRef = useRef(true);
	const { setLastSavedMarkdown } = useEditorContext();

	useEffect(() => {
		// 初期レンダリング時のみエディタを更新する
		if (initialRenderRef.current) {
			editor.update(() => {
				$convertFromMarkdownString(markdown, TRANSFORMERS, undefined, true);
			});
			setLastSavedMarkdown(markdown);
			initialRenderRef.current = false;
			return;
		}
	}, [editor, markdown, setLastSavedMarkdown]);

	return null;
}
