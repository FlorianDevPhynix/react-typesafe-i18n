import { describe, test, expect } from 'vitest';
import { parse } from './parser';

describe('parser', () => {
	test('invalid input', () => {
		const schema = {
			testentry: 'schema value',
			list: ['schema list entry'],
		};

		expect(parse(schema, undefined)).toEqual(schema);
		expect(parse(schema, null)).toEqual(schema);
		expect(parse(schema, ['schema list entry'])).toEqual(schema);
		expect(parse(schema, 'schema list entry')).toEqual(schema);
		expect(parse(schema, true)).toEqual(schema);
		expect(parse(schema, false)).toEqual(schema);
		expect(parse(schema, 0)).toEqual(schema);
		expect(parse(schema, 1)).toEqual(schema);
		expect(parse(schema, BigInt(0))).toEqual(schema);
		expect(parse(schema, Symbol('test'))).toEqual(schema);
		expect(parse(schema, Date.now())).toEqual(schema);
	});

	test('object', () => {
		const schema = {
			testentry: 'schema value',
		};

		const value = {
			testentry: 'value',
		};

		expect(parse(schema, value)).toEqual(value);
	});

	test('object with nested', () => {
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

		expect(parse(schema, value)).toEqual(value);
	});

	test('object with array', () => {
		const schema = {
			testentry: 'schema value',
			list: ['schema list entry'],
		};

		const value = {
			testentry: 'value',
			list: ['first list entry', 'second list entry'],
		};

		expect(parse(schema, value)).toEqual(value);
	});

	test('object with number key', () => {
		const schema = {
			1: 'schema value',
			list: ['schema list entry'],
		};

		const value = {
			1: 'value',
			list: ['first list entry', 'second list entry'],
		};

		expect(parse(schema, value)).toEqual(value);
	});

	test('missing propertys', () => {
		const schema = {
			1: 'schema value',
			list: ['schema list entry'],
			test: '',
		};

		const value = {
			test: 'test',
		};

		expect(parse(schema, value)).toEqual({
			1: 'schema value',
			list: ['schema list entry'],
			test: 'test',
		});
	});
});
