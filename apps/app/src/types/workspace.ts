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

export type WorkspaceInfo = {
	path: string;
	tree: FileSystemNode[];
};