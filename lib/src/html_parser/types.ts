export type TextNode = {
	type: 'text';
	text: string;
};

export type Attributes = Record<string, string>;

export type ElementNode = {
	type: 'element';
	tag: string;
	attributes: Attributes;
	children: RenderNode[];
};

export type RenderNode = TextNode | ElementNode;

export type FilterAttributesFunc = (propertys: Attributes) => Attributes;
export type FilterElementTagsFunc = (tag: string) => boolean;

export type ParseElementFunc = (token: string) => {
	tag: string;
	attributes: Attributes;
};

export type ParseAttributeFunc = (
	input: string,
	index: number
) => {
	value?: string;
	index: number;
};

export type HtmlParser = (
	input: string,
	filterAttributes: FilterAttributesFunc,
	filterElementTags: FilterElementTagsFunc
) => RenderNode[];
