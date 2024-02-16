import { Attributes, ParseAttributeFunc } from './types';

export const ValidAttributeChars = /[a-zA-Z]/;
const WhitespaceMatch = /\s/;

/**
 *
 * extract value of attribute from string
 * @param input - must begin after =, spaces will be skiped over
 * @param index - start position
 * @returns index of next character after end of attribute value
 */
export function parseAttributeValue(
	input: string,
	index: number
): ReturnType<ParseAttributeFunc> {
	for (; index < input.length; index++) {
		if (input[index] === '"') {
			const start = ++index;
			for (; index < input.length; index++) {
				if (input[index] === '"') {
					return {
						value: input.substring(start, index),
						index: ++index,
					};
				}
			}
		} else {
			if (!WhitespaceMatch.test(input[index])) {
				return { index: index };
			}
		}
	}
	return { index: index };
}

/**
 * parse html element attributes
 * @param input - string to be parsed, must not contain element tag
 * @returns object of attributes and their values
 */
export function parseAttributes(
	input: string,
	index: number,
	parse_value: ParseAttributeFunc
) {
	//const parse_value = parse_attribute_value;
	const attributes: Attributes = {};
	input = input.trim();
	for (; index < input.length; index++) {
		if (input[index] === '"') {
			// value without attribute name, invalid, skip to next "
			// just a optimization to quickly skip over invalid values
			index++;
			for (; index < input.length; index++) {
				if (input[index] === '"') {
					break;
				}
			}
		} else if (ValidAttributeChars.test(input[index])) {
			// attribute name begins, parse this attribute
			const name_start = index++;
			for (; index < input.length; index++) {
				if (input[index] === '=') {
					// equals sign found now only spaces and a value in "" are allowed
					const name = input.substring(name_start, index);
					const result = parse_value(input, ++index);
					if (result.value !== undefined) {
						attributes[name] = result.value;
					} else {
						attributes[name] = ''; //true
					}
				} else if (WhitespaceMatch.test(input[index])) {
					// equals sign found now only spaces and a value in "" are allowed
					const name = input.substring(name_start, index);
					index++;
					for (; index < input.length; index++) {
						if (input[index] === '=') {
							const result = parse_value(input, ++index);
							if (result.value !== undefined) {
								attributes[name] = result.value;
							} else {
								attributes[name] = ''; //true
							}
						} else {
							if (!WhitespaceMatch.test(input[index])) {
								break;
							}
						}
					}
				} else if (!ValidAttributeChars.test(input[index])) {
					break;
				}
			}
		}
	}
	return attributes;
}
