import { vi, describe, test, expect } from 'vitest';
import { parseAttributes, parseAttributeValue } from './attributes';

describe('parseAttributeValue', () => {
	test('basic', () => {
		const input = '"test"';
		expect(parseAttributeValue(input, 0)).toEqual({
			index: input.length,
			value: 'test',
		});
	});

	test('with spaces before', () => {
		const input = '  "test"';
		expect(parseAttributeValue(input, 0)).toEqual({
			index: input.length,
			value: 'test',
		});
	});

	test('with spaces after', () => {
		const input = '"test"  ';
		expect(parseAttributeValue('"test"  ', 0)).toEqual({
			index: input.length - 2,
			value: 'test',
		});
	});

	test('with tabs', () => {
		const input = '		 "test"';
		expect(parseAttributeValue(input, 0)).toEqual({
			index: input.length,
			value: 'test',
		});
	});

	test('with tabs & spaces in value', () => {
		expect(parseAttributeValue('  "  test		 "', 0)).toEqual({
			index: 13,
			value: '  test		 ',
		});
	});
});

describe('parseAttributes single', () => {
	test('basic with mock', () => {
		const input = 'id="test"';
		const parse_value = vi.fn().mockReturnValue({
			index: input.length,
			value: 'test',
		});
		expect(parseAttributes(input, 0, parse_value)).toEqual({
			id: 'test',
		});
	});

	test('basic', () => {
		const input = 'id="test"';
		const parse_value = vi.fn().mockImplementation(parseAttributeValue);

		const result = parseAttributes(input, 0, parse_value);
		expect(parse_value).toHaveBeenCalledWith(input, 3);
		expect(parse_value).toHaveNthReturnedWith(1, {
			index: input.length,
			value: 'test',
		});
		expect(result).toEqual({
			id: 'test',
		});
	});

	test('space before equals', () => {
		const input = 'id  ="test"';
		const parse_value = vi.fn().mockImplementation(parseAttributeValue);

		const result = parseAttributes(input, 0, parse_value);
		expect(parse_value).toHaveBeenCalledWith(input, 5);
		expect(parse_value).toHaveNthReturnedWith(1, {
			index: input.length,
			value: 'test',
		});
		expect(result).toEqual({
			id: 'test',
		});
	});

	test('space after equals', () => {
		const input = 'id=  "test"';
		const parse_value = vi.fn().mockImplementation(parseAttributeValue);

		const result = parseAttributes(input, 0, parse_value);
		expect(parse_value).toHaveBeenCalledWith(input, 3);
		expect(parse_value).toHaveNthReturnedWith(1, {
			index: input.length,
			value: 'test',
		});
		expect(result).toEqual({
			id: 'test',
		});
	});

	test('space around equals', () => {
		const input = 'id  =  "test"';
		const parse_value = vi.fn().mockImplementation(parseAttributeValue);

		const result = parseAttributes(input, 0, parse_value);
		expect(parse_value).toHaveBeenCalledWith(input, 5);
		expect(parse_value).toHaveNthReturnedWith(1, {
			index: input.length,
			value: 'test',
		});
		expect(result).toEqual({
			id: 'test',
		});
	});
});

describe('parseAttributes multiple', () => {
	test('basic', () => {
		const input = 'id="test" class="test"';
		const parse_value = vi.fn().mockImplementation(parseAttributeValue);

		const result = parseAttributes(input, 0, parse_value);
		// first attribute
		expect(parse_value).toHaveBeenNthCalledWith(1, input, 3);
		expect(parse_value).toHaveNthReturnedWith(1, {
			index: 9, // space between attributes after first value
			value: 'test',
		});
		// second attribute
		expect(parse_value).toHaveNthReturnedWith(2, {
			index: input.length,
			value: 'test',
		});
		expect(parse_value).toHaveBeenNthCalledWith(2, input, 16);

		expect(result).toEqual({
			id: 'test',
			class: 'test',
		});
	});
});
