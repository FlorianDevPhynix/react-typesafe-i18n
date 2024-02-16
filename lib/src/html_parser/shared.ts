import {
	ElementNode,
	FilterAttributesFunc as FilterAttributesFunc,
	FilterElementTagsFunc as FilterElementTagsFunc,
	ParseElementFunc,
} from './types';

export const TokenizeMatch = /(<[^<>]+>)/;
const NonTagNameMatch = /[^a-zA-Z]/;

/**
 * separate insides of html element into tag and attributes
 * @param token - everything inside the html tag (between < and >)
 * @returns only the tag if there are no attributes or also the string with the attributes
 */
export function splitHtmlElement(token: string, separator: string) {
	token = token.trimStart();
	const separation = token.indexOf(separator);
	if (separation > 0) {
		return {
			tag: token.substring(0, separation).trimEnd(),
			// everything after element tag are attributes as a json string
			attributes: token.substring(separation + 1, token.length),
		};
	} else {
		// no attributes only tag
		return { tag: token };
	}
}

/**
 * recursive html parsing function that filters properties & elements
 *
 * properties/attributes parsed as json, so need to be space separated and
 * @param tokens - list of tokens to parse
 * @param index - numerical position in tokens to continue parsing from
 * @param parent - Parent element that all current elements will be children of
 * @param parseElement - function parse the inside of a html element into tag and attributes (json object)
 * @param filterAttributes - function to filter the attributes of elements
 * @param filterElementTags - function to filter the elements based on their tag
 * @returns when end of parent element found
 */
export function parseChildren(
	tokens: string[],
	index: number,
	parent: ElementNode,
	parseElement: ParseElementFunc,
	filterAttributes: FilterAttributesFunc,
	filterElementTags: FilterElementTagsFunc
) {
	for (; index < tokens.length; index++) {
		let token = tokens[index];

		if (token.startsWith('<') && token.endsWith('>')) {
			token = token.substring(1, token.length - 1); // remove < and >
			if (token.endsWith('/')) {
				// html element without closing tag
				token = token.substring(0, token.length - 1); // remove trailing /
				const result = parseElement(token);
				//console.log(result);
				parent.children.push({
					type: 'element',
					tag: result.tag,
					attributes: result.attributes,
					children: [],
				});
			} else if (token.startsWith('/')) {
				// parent closing tag
				token = token.substring(1).trimStart(); // remove leading / and whitepsace
				const pos = token.search(NonTagNameMatch); // index of first non-word character
				const tag = token.substring(0, pos !== -1 ? pos : undefined); // skip everything after tag
				//console.log(token, result);
				if (parent.tag !== tag) {
					console.error(
						`${parent.tag} closing tag expected: received "${tag}"`
					);
				}
				break;
			} else {
				// opening tag of child element
				const element_result = parseElement(token);
				//console.log(element_result);
				const result = parseChildren(
					tokens,
					index + 1,
					{
						type: 'element',
						tag: element_result.tag,
						attributes: element_result.attributes,
						children: [],
					},
					parseElement,
					filterAttributes,
					filterElementTags
				);
				//console.log(result);
				index = result.index;
				parent.children.push(result.element);
			}
		} else {
			if (token.trim() !== '') {
				parent.children.push({
					type: 'text',
					text: token,
				});
			}
		}
	}

	// filter attributes
	parent.attributes = filterAttributes(parent.attributes);
	// filter child elements
	parent.children = parent.children.filter((node) => {
		if (node.type === 'text') return true;
		return filterElementTags(node.tag);
	});
	return { index, element: parent };
}
