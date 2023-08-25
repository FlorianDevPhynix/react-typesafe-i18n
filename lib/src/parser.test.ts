import { describe, test, expect } from 'vitest';
import { parse } from './parser';

describe('parser', () => {
	test('basic object', () => {
		const schema = {
			testentry: 'schema value',
		};

		const value = {
			testentry: 'value',
		};

		expect(parse(schema, value)).toEqual({ testentry: 'value' });
	});

	test('basic object with nested', () => {
		const schema = {
			testentry: 'schema value',
			nested: {
				entry: 'nested schema value',
			},
		};

		const value = {
			testentry: 'value',
			nested: {
				entry: 'nested value',
			},
		};

		expect(parse(schema, value)).toEqual({
			testentry: 'value',
			nested: {
				entry: 'nested value',
			},
		});
	});

	test('basic object with array', () => {
		const schema = {
			testentry: 'schema value',
			list: ['schema list entry'],
		};

		const value = {
			testentry: 'value',
			list: ['first list entry', 'second list entry'],
		};

		expect(parse(schema, value)).toEqual({
			testentry: 'value',
			list: ['first list entry', 'second list entry'],
		});
	});
});
