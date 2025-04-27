import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
	TRANSFORMERS as BUILT_IN_TRANSFORMERS,
	type ElementTransformer,
	HEADING,
	ORDERED_LIST,
	type Transformer,
	UNORDERED_LIST,
} from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { Klass, LexicalNode } from "lexical";
import { LineBreakNode, ParagraphNode } from "lexical";
import {
	$isHorizontalRuleNode,
	$createHorizontalRuleNode,
	HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";

export const HR: ElementTransformer = {
	dependencies: [HorizontalRuleNode],
	export: (node: LexicalNode) => {
		return $isHorizontalRuleNode(node) ? "***" : null;
	},
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: 'element',
};


export const TRANSFORMERS: Array<Transformer> = [
	...BUILT_IN_TRANSFORMERS,
	HEADING,
	UNORDERED_LIST,
	ORDERED_LIST,
	HR,
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
	HorizontalRuleNode,
];
