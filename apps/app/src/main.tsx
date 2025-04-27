import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import { App } from "./App";
import { EditorProvider } from "./components/editor/context/editor-context";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<EditorProvider>
			<Toaster position="top-right" />
			<App />
		</EditorProvider>
	</React.StrictMode>,
);
