import { openai } from "@ai-sdk/openai";
import { serve } from "@hono/node-server";
import { type CoreMessage, streamText } from "ai";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	console.log(process.env.OPENAI_API_KEY, "OPENAI_API_KEY");
	return c.text("Hello Hono from sidecar-app!!!!");
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
