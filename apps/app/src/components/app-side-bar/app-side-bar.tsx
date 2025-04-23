import { FileTree } from "@/components/file-tree";
import type { WorkspaceInfo } from "@/types/workspace";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
} from "../ui/sidebar";

type AppSideBarProps = {
	workspace: WorkspaceInfo;
	handleOpenFile: (path: string) => void;
	currentFile: string | null;
};

export const AppSideBar = ({
	workspace,
	handleOpenFile,
	currentFile,
}: AppSideBarProps) => {
	return (
		<Sidebar>
			<SidebarHeader className="px-4 py-3">
				<h2 className="text-lg font-semibold truncate" title={workspace.path}>
					{workspace.path.split(/[\/\\]/).pop() || workspace.path}
				</h2>
			</SidebarHeader>
			<SidebarContent className="px-2 pt-2">
				<SidebarMenu>
					<FileTree
						nodes={workspace.tree}
						onOpenFile={handleOpenFile}
						currentFile={currentFile}
					/>
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
};
