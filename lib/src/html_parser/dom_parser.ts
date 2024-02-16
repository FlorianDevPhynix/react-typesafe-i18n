import {
	FilterAttributesFunc,
	FilterElementTagsFunc,
	RenderNode,
} from './types';

function recursive_transform(
	element: HTMLElement,
	filterAttributes: FilterAttributesFunc,
	filterElementTags: FilterElementTagsFunc
) {
	const result: RenderNode[] = [];
	for (const child of element.childNodes) {
		if (child instanceof Text && child.textContent !== null) {
			result.push({
				type: 'text',
				text: child.textContent,
			});
		} else if (child instanceof HTMLElement) {
			const tag = child.tagName.toLowerCase();
			if (filterElementTags(tag)) {
				result.push({
					type: 'element',
					tag,
					attributes: filterAttributes(
						Object.fromEntries(
							Array.from(child.attributes).map((attr) => [
								attr.name,
								attr.value,
							])
						)
					),
					children: recursive_transform(
						child,
						filterAttributes,
						filterElementTags
					),
				});
			}
		}
	}
	return result;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DomHtmlParser {
	/**
	 * browser native html parser that filters properties & elements
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
		const parser = new DOMParser();
		const result = parser.parseFromString(input, 'text/html');

		return recursive_transform(
			result.body,
			filterAttributes,
			filterElementTags
		);
	}
}
