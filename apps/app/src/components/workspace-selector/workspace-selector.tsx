import { Button } from "../ui/button";

type WorkspaceSelectorProps = {
	onWorkspaceSelected: () => void;
};

export const WorkspaceSelector = ({
	onWorkspaceSelected,
}: WorkspaceSelectorProps) => {
	return (
		<div className="flex-1 flex items-center justify-center">
			<div className="text-center">
				<h2 className="text-xl font-semibold mb-2">
					ワークスペースが選択されていません
				</h2>
				<p className="text-muted-foreground mb-4">
					Markdownファイルを編集するためのワークスペースを選択してください
				</p>
				<Button onClick={onWorkspaceSelected}>ワークスペースを選択</Button>
			</div>
		</div>
	);
};
