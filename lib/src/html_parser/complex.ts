import {
	FilterAttributesFunc,
	FilterElementTagsFunc,
	ParseElementFunc,
} from './types';
import { parseAttributes, parseAttributeValue } from './attributes';
import { TokenizeMatch, parseChildren, splitHtmlElement } from './shared';

/**
 * parse insides of html element into tag and attributes
 * @param token - everything inside the html tag (between < and >)
 * @returns element tag and attributes json object
 */
function parseElement(token: string): ReturnType<ParseElementFunc> {
	const result = splitHtmlElement(token, ' ');

	return {
		tag: result.tag,
		attributes: result.attributes
			? parseAttributes(result.attributes, 0, parseAttributeValue)
			: {},
	};
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ComplexHtmlParser {
	/**
	 * complex html parser that filters properties & elements
	 *
	 * thanks to more complex parsing, attributes follow the html syntax
	 * @example `<p class="example" id="example">children</p>`
	 * @param input - input string
	 * @param filterAttributes - function to filter the propertys of elements
	 * @param filterElementTags - function to filter the elements based on their tag
	 * @returns list of RenderNode's
	 */
	export function parseHtml(
		input: string,
		filterAttributes: FilterAttributesFunc,
		filterElementTags: FilterElementTagsFunc
	) {
		// tokenize
		const tokens = input.split(TokenizeMatch);
		// parse into ast with filtering
		return parseChildren(
			tokens,
			0,
			{
				type: 'element',
				tag: 'div',
				attributes: {},
				children: [],
			},
			parseElement,
			filterAttributes,
			filterElementTags
		).element.children;
	}
}
