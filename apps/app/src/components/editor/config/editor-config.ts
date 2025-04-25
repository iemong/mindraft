import {
	HEADING,
	ORDERED_LIST,
	UNORDERED_LIST,
	type Transformer,
	TRANSFORMERS as BUILT_IN_TRANSFORMERS,
} from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import type { Klass, LexicalNode } from "lexical";
import { LineBreakNode, ParagraphNode } from "lexical";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";

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