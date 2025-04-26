import { openai } from "@ai-sdk/openai";
import { serve } from "@hono/node-server";
import { streamText, type CoreMessage } from "ai";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	return c.text(`Hello Hono from sidecar-app! OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ?? "not set"}`);
});

app.post("/", async (c) => {
	const { messages } = await c.req.json<{ messages: CoreMessage[] }>();

	const result = streamText({
		model: openai("gpt-4o"),
		messages,
	});
	return result.toDataStreamResponse();
});

serve(
	{
		fetch: app.fetch,
		port: 3001,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
