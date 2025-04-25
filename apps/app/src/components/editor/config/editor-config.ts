import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
	TRANSFORMERS as BUILT_IN_TRANSFORMERS,
	HEADING,
	ORDERED_LIST,
	type Transformer,
	UNORDERED_LIST,
} from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { Klass, LexicalNode } from "lexical";
import { LineBreakNode, ParagraphNode } from "lexical";

export const TRANSFORMERS: Array<Transformer> = [
	...BUILT_IN_TRANSFORMERS,
	HEADING,
	UNORDERED_LIST,
	ORDERED_LIST,
];

export const EDITOR_NODES: Array<Klass<LexicalNode>> = [
	HeadingNode,
	ListNode,
	ListItemNode,
	ParagraphNode,
	LineBreakNode,
	QuoteNode,
	CodeNode,
	LinkNode,
];
