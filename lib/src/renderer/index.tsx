import React, { createElement, memo } from 'react';
import {
	Attributes,
	ElementNode,
	FilterAttributesFunc,
	FilterElementTagsFunc,
	HtmlParser,
	RenderNode,
} from '../html_parser/types';
import { ComplexHtmlParser, SimpleHtmlParser } from '../html_parser';
import { DomHtmlParser } from '../html_parser/dom_parser';

export type RenderComponentFunc = (
	node: RenderNode,
	index: number,
	children: undefined | (() => React.ReactNode)
) => React.ReactNode | undefined;

/**
 * default renderComponent implementation
 */
export function default_render(
	node: RenderNode,
	index: number,
	children: Parameters<RenderComponentFunc>['2']
): React.ReactNode {
	if (node.type === 'text') {
		return node.text;
	} else {
		return createElement(
			node.tag,
			{
				key: index,
				...node.attributes,
			},
			children ? children() : undefined
		);
	}
}

export interface ComponentRendererProps {
	input: string;
	parser: HtmlParser;
	/**
	 * Positive list or filter function that moves all allowed elements into a new object
	 */
	filterPropertys: string[] | FilterAttributesFunc;
	/**
	 * Positive list or filter function that returns true for all allowed elements
	 */
	filterComponents: string[] | FilterElementTagsFunc;
	/**
	 * overwrite default or do custom rendering
	 * @param node - Current Node to render
	 * @param index - numerical index in the list of child components
	 * @returns undefined for default rendering or a custom ReactElement
	 */
	renderComponent?: RenderComponentFunc | undefined;
}

/**
 * A React Component that renders components from a string
 * @returns ReactElement with rendered input as children
 */
export const ComponentRenderer = memo(
	function ComponentRenderer(props: ComponentRendererProps): React.ReactNode {
		// add default function if filterPropertys is array
		let filterPropertys: FilterAttributesFunc;
		if (Array.isArray(props.filterPropertys)) {
			const allowed = props.filterPropertys;
			filterPropertys = (props) => {
				const result: Attributes = {};
				for (const key in props) {
					if (allowed.includes(key)) {
						result[key] = props[key];
					}
				}
				return result;
			};
		} else {
			filterPropertys = props.filterPropertys;
		}
		// add default function if filterComponents is array
		let filterComponents: FilterElementTagsFunc;
		if (Array.isArray(props.filterComponents)) {
			const allowed = props.filterComponents;
			filterComponents = (tag) => allowed.includes(tag);
		} else {
			filterComponents = props.filterComponents;
		}

		// parse into ast
		const root = props.parser(
			props.input,
			filterPropertys,
			filterComponents
		);

		function recursive_render(
			parent: Pick<ElementNode, 'children'>,
			renderComponent: RenderComponentFunc
		): React.ReactNode {
			return parent.children.map(
				(node, index) =>
					// render with default when no custom rendering
					renderComponent(
						node,
						index,
						node.type === 'element'
							? () => recursive_render(node, renderComponent)
							: undefined
					) ??
					default_render(
						node,
						index,
						node.type === 'element'
							? () => recursive_render(node, renderComponent)
							: undefined
					)
			);
		}

		// render ast using callback
		if (props.renderComponent !== undefined) {
			const renderComponent = props.renderComponent;
			return recursive_render({ children: root }, renderComponent);
		} else {
			return recursive_render({ children: root }, default_render);
		}
	},
	(prevProps, nextProps) => prevProps.input === nextProps.input
);

/**
 * uses the simple renderer
 *
 * attributes parsed as json (Json.parse), so they need to be valid json strings
 * @example `<p: "class":"example", "id":"example">children</p>`
 */
export function SimpleComponentRenderer(
	props: Omit<ComponentRendererProps, 'parser'>
) {
	return <ComponentRenderer {...props} parser={SimpleHtmlParser.parseHtml} />;
}

/**
 * uses the complex renderer
 *
 * attributes follow the html syntax
 * @example `<p class="example" id="example">children</p>`
 */
export function ComplexComponentRenderer(
	props: Omit<ComponentRendererProps, 'parser'>
) {
	return (
		<ComponentRenderer {...props} parser={ComplexHtmlParser.parseHtml} />
	);
}

/**
 * uses the Dom renderer
 *
 * attributes follow the html syntax
 * @example `<p class="example" id="example">children</p>`
 */
export function DomComponentRenderer(
	props: Omit<ComponentRendererProps, 'parser'>
) {
	return <ComponentRenderer {...props} parser={DomHtmlParser.parseHtml} />;
}
