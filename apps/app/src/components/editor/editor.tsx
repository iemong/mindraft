import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HeadingNode } from "@lexical/rich-text";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { type Transformer, HEADING } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";

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
