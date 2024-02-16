import { describe, test, expect } from 'vitest';
import { splitHtmlElement, parseChildren } from './shared';

describe('object merge', () => {
	test('basic', () => {
		const result = Object.fromEntries(
			Object.entries({ id: 'test' }).concat(
				Object.entries({ className: 'test', id: 'test2' })
			)
		);

		expect(result).toMatchObject({ id: 'test2' });
	});
});

describe('splitHtmlElement', () => {
	test('space separator', () => {
		const input = 'first second ';
		expect(splitHtmlElement(input, ' ')).toEqual({
			tag: 'first',
			attributes: 'second ',
		});
	});

	test('double dots separator', () => {
		const input = 'first: second:';
		expect(splitHtmlElement(input, ':')).toEqual({
			tag: 'first',
			attributes: ' second:',
		});
	});

	test('no separator', () => {
		const input = 'first second';
		expect(splitHtmlElement(input, ':')).toEqual({
			tag: 'first second',
			attributes: undefined,
		});
	});

	test('no attributes', () => {
		const input = 'first';
		expect(splitHtmlElement(input, ':')).toEqual({
			tag: 'first',
			attributes: undefined,
		});
	});

	test('with spaces', () => {
		const input = '  first  : second';
		expect(splitHtmlElement(input, ':')).toEqual({
			tag: 'first',
			attributes: ' second',
		});
	});
});
