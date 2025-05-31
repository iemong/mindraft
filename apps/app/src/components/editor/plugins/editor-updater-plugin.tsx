import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { useEditorContext } from "../context/editor-context";

export function EditorUpdaterPlugin({ markdown }: { markdown: string }) {
	const [editor] = useLexicalComposerContext();
	const initialRenderRef = useRef(true);
	const lastMarkdownRef = useRef(markdown);
	const { setLastSavedMarkdown, isEditing } = useEditorContext();

	useEffect(() => {
		// 初期レンダリング時のみエディタを更新する
		if (initialRenderRef.current) {
			editor.update(() => {
				$convertFromMarkdownString(markdown, TRANSFORMERS, undefined, true);
			});
			setLastSavedMarkdown(markdown);
			initialRenderRef.current = false;
			lastMarkdownRef.current = markdown;
			return;
		}

		// 外部からのコンテンツ更新（エディタが編集中でない場合のみ）
		if (!isEditing && markdown !== lastMarkdownRef.current) {
			editor.update(() => {
				$convertFromMarkdownString(markdown, TRANSFORMERS, undefined, true);
			});
			lastMarkdownRef.current = markdown;
		}
	}, [editor, markdown, setLastSavedMarkdown, isEditing]);

	return null;
}
