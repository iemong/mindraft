import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<Toaster position="top-right" />
		<App />
	</React.StrictMode>,
);
