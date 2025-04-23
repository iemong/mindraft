import { LayoutDashboard } from "lucide-react";

export const Empty = () => {
	return (
		<div className="h-full flex items-center justify-center text-muted-foreground">
			<div className="text-center">
				<LayoutDashboard className="mx-auto h-8 w-8 mb-2" />
				<p>ファイルを選択してください</p>
			</div>
		</div>
	);
};
