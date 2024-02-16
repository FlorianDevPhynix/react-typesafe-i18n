import { describe, test, expect } from 'vitest';
import { ComplexHtmlParser } from './complex';
import {
	Attributes,
	FilterAttributesFunc,
	FilterElementTagsFunc,
} from './types';

describe('ComplexHtmlParser', () => {
	const allowed_props = ['id', 'class'];
	const allowed_comp = ['div', 'p', 'strong'];

	const filterAttributes: FilterAttributesFunc = (props) => {
		const result: Attributes = {};
		for (const key in props) {
			if (allowed_props.includes(key)) {
				result[key] = props[key];
			}
		}
		return result;
	};
	// add default function if filterComponents is array
	const filterElementTags: FilterElementTagsFunc = (tag) =>
		allowed_comp.includes(tag);

	test('basic', () => {
		const result = ComplexHtmlParser.parseHtml(
			'Some text <p>with a html element</p> and more text.',
			filterAttributes,
			filterElementTags
		);

		expect(result).toHaveLength(3);
		expect(result).toEqual(
			expect.arrayContaining([
				{
					type: 'text',
					text: 'Some text ',
				},
				{
					type: 'element',
					tag: 'p',
					attributes: {},
					children: [
						{
							type: 'text',
							text: 'with a html element',
						},
					],
				},
				{
					type: 'text',
					text: ' and more text.',
				},
			])
		);
	});

	test('with id', () => {
		const result = ComplexHtmlParser.parseHtml(
			'Some text <p id="test">with a html element</p class="test"> and more text.',
			filterAttributes,
			filterElementTags
		);

		expect(result).toHaveLength(3);
		expect(result).toEqual(
			expect.arrayContaining([
				{
					type: 'text',
					text: 'Some text ',
				},
				{
					type: 'element',
					tag: 'p',
					attributes: {
						id: 'test',
					},
					children: [
						{
							type: 'text',
							text: 'with a html element',
						},
					],
				},
				{
					type: 'text',
					text: ' and more text.',
				},
			])
		);
	});

	/* test('with property merging', () => {
		const result = ComplexHtmlParser.parseHtml(
			'Some text <p id="test">with a html element</p id="merged" class="test"> and more text.',
			filterAttributes,
			filterElementTags
		);

		expect(result).toHaveLength(3);
		expect(result).toEqual(
			expect.arrayContaining([
				{
					type: 'text',
					text: 'Some text ',
				},
				{
					type: 'element',
					tag: 'p',
					attributes: {
						id: 'merged',
						class: 'test',
					},
					children: [
						{
							type: 'text',
							text: 'with a html element',
						},
					],
				},
				{
					type: 'text',
					text: ' and more text.',
				},
			])
		);
	}); */

	test('with children', () => {
		const result = ComplexHtmlParser.parseHtml(
			'Some text <p>with a <strong>html</strong> element</p> and more text.',
			filterAttributes,
			filterElementTags
		);

		expect(result).toHaveLength(3);
		expect(result).toEqual(
			expect.arrayContaining([
				{
					type: 'text',
					text: 'Some text ',
				},
				{
					type: 'element',
					tag: 'p',
					attributes: {},
					children: [
						{
							type: 'text',
							text: 'with a ',
						},
						{
							type: 'element',
							tag: 'strong',
							attributes: {},
							children: [
								{
									type: 'text',
									text: 'html',
								},
							],
						},
						{
							type: 'text',
							text: ' element',
						},
					],
				},
				{
					type: 'text',
					text: ' and more text.',
				},
			])
		);
	});
});
