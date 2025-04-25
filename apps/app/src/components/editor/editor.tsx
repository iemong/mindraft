import { $convertFromMarkdownString } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { editorTheme } from "./edit-theme";
import { EditorUpdaterPlugin } from "./plugins/editor-updater-plugin";
import { MarkdownOnChangePlugin } from "./plugins/markdown-on-change-plugin";
import { EDITOR_NODES, TRANSFORMERS } from "./config/editor-config";

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed.
function onError(error: Error) {
	console.error(error);
}

type EditorProps = {
	initialMarkdown: string;
	onMarkdownChange: (markdown: string) => void;
};

const initialConfigBase = {
	namespace: "MyEditor",
	theme: editorTheme,
	onError,
	nodes: EDITOR_NODES,
};

export const Editor = ({ initialMarkdown, onMarkdownChange }: EditorProps) => {
	const composerConfig = {
		...initialConfigBase,
		editorState: () =>
			$convertFromMarkdownString(initialMarkdown, TRANSFORMERS),
	};

	return (
		<LexicalComposer initialConfig={composerConfig}>
			<div className="h-full w-full relative">
				<RichTextPlugin
					contentEditable={
						<ContentEditable
							aria-placeholder={"Enter some text..."}
							placeholder={
								<div className="text-muted-foreground absolute inset-0 pointer-events-none">
									Enter some text...
								</div>
							}
						/>
					}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<HistoryPlugin />
				<AutoFocusPlugin />
				<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
				<ListPlugin hasStrictIndent={true} />
				<EditorUpdaterPlugin markdown={initialMarkdown} />
				<MarkdownOnChangePlugin onMarkdownChange={onMarkdownChange} />
			</div>
		</LexicalComposer>
	);
};
