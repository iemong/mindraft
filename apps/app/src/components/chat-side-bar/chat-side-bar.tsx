import { useChat } from "@ai-sdk/react";
import { Sidebar } from "../ui/sidebar";
import { API_ENDPOINT } from "../../lib/constants";

export const ChatSideBar = () => {
	const { messages, input, handleInputChange, handleSubmit } = useChat({
		api: API_ENDPOINT,
	});

	return (
		<Sidebar side="right" className="flex flex-col">
			<div className="flex flex-col w-full max-w-md px-4 py-24 relative">
				{messages.map((message) => (
					<div key={message.id} className="whitespace-pre-wrap">
						{message.role === "user" ? "User: " : "AI: "}
						{message.parts.map((part, i) => {
							switch (part.type) {
								case "text":
									return <div key={`${message.id}-${i}`}>{part.text}</div>;
							}
						})}
					</div>
				))}

				<form onSubmit={handleSubmit}>
					<input
						className="fixed dark:bg-zinc-900 bottom-0 p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
						value={input}
						placeholder="Say something..."
						onChange={handleInputChange}
					/>
				</form>
			</div>
		</Sidebar>
	);
};
