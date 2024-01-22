import { safeParse, Output, record, unknown } from 'valibot';

const ObjectSchema = record(unknown());
export type ObjectType = Output<typeof ObjectSchema>;

function parse_value(schema: unknown, value: unknown) {
	let result: unknown;

	if (Array.isArray(schema)) {
		if (Array.isArray(value)) {
			result = value;
		} else {
			result = schema;
		}
	} else if (typeof schema === 'object') {
		if (typeof value === 'object') {
			const valueResult = safeParse(ObjectSchema, value);
			if (valueResult.success) {
				result = parse_object(
					schema as Record<string, unknown>,
					valueResult.output
				);
			} else {
				result = schema;
			}
		} else {
			result = schema;
		}
	} else if (typeof schema === 'string') {
		if (typeof value === 'string') {
			result = value;
		} else {
			result = schema;
		}
	}

	return result;
}

/* function parse_array(schema: unknown[], value: unknown[]) {
	const result: unknown[] = [];

	schema.forEach((schema_value, index) =>
		result.push(parse_value(schema_value, value[index]))
	);

	return result;
} */

function parse_object(schema: ObjectType, value: ObjectType) {
	const result: ObjectType = {};

	for (const key of Object.keys(schema)) {
		result[key] = parse_value(schema[key], value[key]);
	}

	return result;
}

/**
 *
 * @param schema - Schema with default values.
 * @param value - The value to be parsed against the schema
 * @returns The parsed object.
 */
export function parse<Base extends ObjectType>(
	schema: Base,
	value: unknown
): Base {
	const result = safeParse(ObjectSchema, value);
	if (!result.success) {
		return schema;
	}
	return parse_object(schema, result.data) as Base;
}
