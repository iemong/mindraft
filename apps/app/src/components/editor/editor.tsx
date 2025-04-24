import { HEADING, type Transformer } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";

export const TRANSFORMERS: Array<Transformer> = [HEADING];

const theme = {
	// Theme styling goes here
	// ...
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed.
function onError(error: Error) {
	console.error(error);
}

const initialConfig = {
	namespace: "MyEditor",
	theme,
	onError,
	nodes: [HeadingNode],
};

export const Editor = () => {
	return (
		<LexicalComposer initialConfig={initialConfig}>
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
			</div>
		</LexicalComposer>
	);
};
