import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { useEditorContext } from "../context/editor-context";

export function EditorUpdaterPlugin({ markdown }: { markdown: string }) {
	const [editor] = useLexicalComposerContext();
	const initialRenderRef = useRef(true);
	const { isEditing, lastSavedMarkdown, setLastSavedMarkdown } =
		useEditorContext();

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

		// 編集中でない場合、かつマークダウンが前回保存時と異なる場合のみ更新
		if (!isEditing && markdown !== lastSavedMarkdown) {
			setLastSavedMarkdown(markdown);
			// 選択範囲とフォーカスを保存
			const selection = window.getSelection();
			const activeElement = document.activeElement;
			const editorRootElement = editor.getRootElement();
			const hadFocus = editorRootElement?.contains(activeElement);

			editor.update(() => {
				$convertFromMarkdownString(markdown, TRANSFORMERS, undefined, true);
			});

			// 編集中でない場合のみ、フォーカスを復元
			if (hadFocus && editorRootElement) {
				// フォーカスを復元するタイミングを少し遅らせる
				setTimeout(() => {
					editorRootElement.focus();
					if (selection && selection.rangeCount > 0) {
						try {
							selection.removeAllRanges();
							selection.addRange(selection.getRangeAt(0));
						} catch (e) {
							console.error("Failed to restore selection", e);
						}
					}
				}, 0);
			}
		}
	}, [editor, markdown, isEditing, lastSavedMarkdown, setLastSavedMarkdown]);

	return null;
}
