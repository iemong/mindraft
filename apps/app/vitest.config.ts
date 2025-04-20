import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
	plugins: [react(), tailwindcss()],
	test: {
		css: true,
		setupFiles: ["./vitest.setup.ts"],
		browser: {
			enabled: true,
			provider: "playwright",
			instances: [{ browser: "chromium" }],
		},
	},
});
