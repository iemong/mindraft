import { useChat } from "@ai-sdk/react";
import { Bot, Clipboard, Copy, User } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINT } from "../../lib/constants";
import { useEditorContext } from "../editor/context/editor-context";
import { Button } from "../ui/button";
import { Sidebar } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type MessageProps = {
	message: {
		id: string;
		role: string;
		parts: Array<{ type: string; text?: string }>;
	};
	onCopyToEditor: (content: string) => void;
	onCopyToClipboard: (content: string) => void;
};

const Message = ({
	message,
	onCopyToEditor,
	onCopyToClipboard,
}: MessageProps) => {
	const isUser = message.role === "user";
	const messageContent = message.parts
		.filter((part) => part.type === "text")
		.map((part) => {
			if (part.type === "text" && "text" in part) {
				return part.text;
			}
			return "";
		})
		.join("");

	return (
		<div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
			{!isUser && (
				<div className="flex-shrink-0">
					<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
						<Bot className="h-4 w-4 text-primary" />
					</div>
				</div>
			)}

			<div
				className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
			>
				<div
					className={`rounded-lg px-3 py-2 ${
						isUser ? "bg-primary text-primary-foreground" : "bg-muted"
					}`}
				>
					<div className="whitespace-pre-wrap break-words">
						{messageContent}
					</div>
				</div>

				{!isUser && messageContent && (
					<MessageActions
						onCopyToEditor={() => onCopyToEditor(messageContent)}
						onCopyToClipboard={() => onCopyToClipboard(messageContent)}
					/>
				)}
			</div>

			{isUser && (
				<div className="flex-shrink-0">
					<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
						<User className="h-4 w-4 text-primary-foreground" />
					</div>
				</div>
			)}
		</div>
	);
};

type MessageActionsProps = {
	onCopyToEditor: () => void;
	onCopyToClipboard: () => void;
};

const MessageActions = ({
	onCopyToEditor,
	onCopyToClipboard,
}: MessageActionsProps) => (
	<div className="flex gap-1 mt-1">
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					size="sm"
					variant="ghost"
					className="h-7 w-7 p-0"
					onClick={onCopyToEditor}
				>
					<Copy className="h-3.5 w-3.5" />
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>エディタにコピー</p>
			</TooltipContent>
		</Tooltip>
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					size="sm"
					variant="ghost"
					className="h-7 w-7 p-0"
					onClick={onCopyToClipboard}
				>
					<Clipboard className="h-3.5 w-3.5" />
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>クリップボードにコピー</p>
			</TooltipContent>
		</Tooltip>
	</div>
);

export const ChatSideBar = () => {
	const { messages, input, handleInputChange, handleSubmit } = useChat({
		api: API_ENDPOINT,
	});
	const { appendToEditor, currentFile } = useEditorContext();

	const handleCopyToEditor = (content: string) => {
		if (!currentFile) {
			toast.error("ファイルを開いてからコピーしてください");
			return;
		}

		appendToEditor(content);
		toast.success("エディタにコピーしました");
	};

	const handleCopyToClipboard = async (content: string) => {
		try {
			await navigator.clipboard.writeText(content);
			toast.success("クリップボードにコピーしました");
		} catch (err) {
			toast.error("コピーに失敗しました");
		}
	};

	return (
		<Sidebar side="right" className="flex flex-col">
			<div className="flex flex-col w-full max-w-md px-4 py-6 relative h-full">
				<div className="flex-1 overflow-y-auto space-y-4 pb-20">
					{messages.map((message) => (
						<Message
							key={message.id}
							message={message}
							onCopyToEditor={handleCopyToEditor}
							onCopyToClipboard={handleCopyToClipboard}
						/>
					))}
				</div>

				<form
					onSubmit={handleSubmit}
					className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t"
				>
					<input
						className="w-full p-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
						value={input}
						placeholder="メッセージを入力..."
						onChange={handleInputChange}
					/>
				</form>
			</div>
		</Sidebar>
	);
};
