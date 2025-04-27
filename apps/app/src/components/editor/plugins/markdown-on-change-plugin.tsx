import { $convertToMarkdownString } from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";
import { TRANSFORMERS } from "../config/editor-config";
import { useEditorContext } from "../context/editor-context";

type MarkdownOnChangePluginProps = {
	onMarkdownChange: (markdown: string) => void;
};

export const MarkdownOnChangePlugin = ({
	onMarkdownChange,
}: MarkdownOnChangePluginProps) => {
	const { setIsEditing } = useEditorContext();

	const handleOnChange = (editorState: EditorState) => {
		// ユーザーがエディタを編集したときに呼ばれる
		setIsEditing(true);

		// マークダウンに変換して親コンポーネントに通知
		editorState.read(() => {
			const markdown = $convertToMarkdownString(TRANSFORMERS);
			onMarkdownChange(markdown);

			// 親コンポーネントにマークダウン変更を通知後、
			// 編集状態を非編集中にリセット（次の入力まで）
			setTimeout(() => {
				setIsEditing(false);
			}, 100);
		});
	};

	return <OnChangePlugin onChange={handleOnChange} />;
};
