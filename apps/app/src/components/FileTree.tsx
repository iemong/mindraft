import {
	ChevronDown,
	ChevronRight,
	File as FileIcon,
	Folder,
	FolderOpen,
} from "lucide-react";
import type React from "react"; // React をインポート
import { cn } from "@/lib/utils"; // cn をインポート
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Collapsible をインポート
import { SidebarMenuButton } from "@/components/ui/sidebar"; // SidebarMenuButton をインポート

// FileSystemNode 型定義 (App.tsx と同じものを定義)
export type FileSystemNode =
	| {
			type: "File";
			name: string;
			path: string;
	  }
	| {
			type: "Directory";
			name: string;
			path: string;
			children: FileSystemNode[];
	  };

// FileTreeProps インターフェース定義
interface FileTreeProps {
	nodes: FileSystemNode[];
	onOpenFile: (path: string) => void;
	currentFile: string | null;
	level?: number; // 階層レベル（インデント用）
}

// FileTree コンポーネント定義
const FileTree: React.FC<FileTreeProps> = ({
	nodes,
	onOpenFile,
	currentFile,
	level = 0,
}) => {
	return (
		<>
			{nodes.map((node) => {
				const paddingLeft = `${level * 1.5}rem`; // levelに応じてインデント

				if (node.type === "Directory") {
					// ディレクトリが空の場合はレンダリングしない（任意）
					// if (node.children.length === 0) {
					//  return null;
					// }
					return (
						<Collapsible key={node.path} defaultOpen={level < 1}>
							<CollapsibleTrigger asChild>
								<div
									className={cn(
										"flex items-center w-full text-sm px-3 py-1.5 rounded-md hover:bg-muted cursor-pointer group",
									)}
									style={{ paddingLeft }}
								>
									<ChevronRight className="h-4 w-4 mr-2 group-data-[state=open]:hidden" />
									<ChevronDown className="h-4 w-4 mr-2 group-data-[state=closed]:hidden" />
									<Folder className="h-4 w-4 mr-2 group-data-[state=open]:hidden text-sky-500" />
									<FolderOpen className="h-4 w-4 mr-2 group-data-[state=closed]:hidden text-sky-500" />
									<span>{node.name}</span>
								</div>
							</CollapsibleTrigger>
							<CollapsibleContent>
								{/* 再帰的に子ノードを描画 */}
								<FileTree
									nodes={node.children}
									onOpenFile={onOpenFile}
									currentFile={currentFile}
									level={level + 1}
								/>
							</CollapsibleContent>
						</Collapsible>
					);
				}
				// ファイルの場合
				return (
					<SidebarMenuButton
						key={node.path}
						isActive={currentFile === node.path}
						onClick={() => onOpenFile(node.path)}
						style={{ paddingLeft }}
						className="w-full justify-start text-sm font-normal"
					>
						<FileIcon className="mr-2 h-4 w-4 text-gray-500" />
						<span>{node.name}</span>
					</SidebarMenuButton>
				);
			})}
		</>
	);
};

export default FileTree; // デフォルトエクスポートを追加
