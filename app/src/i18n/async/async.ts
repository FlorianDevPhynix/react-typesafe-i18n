import * as v from 'valibot';

import { AsyncProvider } from 'react-safe-i18n';

// language entry validation schema
export const languageSchema = v.object({
	code: v.string([v.minLength(2, 'language tag is too short')]),
	direction: v.enumType(['ltr', 'rtl']),
	langData: v.object({
		name: v.string([v.minLength(1, 'language name is empty')]),
		icon: v.optional(v.string()),
	}),
});
// infer type from schema
export type Language = v.Output<typeof languageSchema>;

// schema to verify list of objects
export const languageListSchema = v.array(v.record(v.unknown()), [
	v.minLength(1, 'The language array is empty'),
]);

// schema to validate if translation is object
export const translationSchema = v.record(v.unknown());

/* export const translationsSchema = v.array(translationSchema, [
	v.minLength(1, 'The translations array is empty'),
]); */

// language rest api fetch utility
export async function lang_rest_fetch(path: string) {
	const result = await fetch(`/rest/i18n/${path}`);
	return result.json();
}

/**
 * fetch a language and it's translation
 * @param language language code
 * @returns a Promise with the received json data
 */
async function getLanguage(language: string) {
	/* return Promise.race([
		new Promise((_, reject) => {
			setTimeout(() => {
				//console.log("timeout")
				reject('timeout');
			}, 10 * 1000);
		}),
		async () => {
		},
	]); */
	const data = await lang_rest_fetch(`translations/${language}`);

	return v.parse(translationSchema, data);
}

/**
 * fetch the list of languages and validate them one by one
 * @returns a Promise with the received list of valid language objects
 */
async function getLanguages() {
	const data = await lang_rest_fetch('languages');

	// check that result is list of objects
	const languagesData = v.safeParse(languageListSchema, data);
	if (!languagesData.success) return [];

	// manually validate every list entry,
	// ensures that the validation does not fail and all valid languages will be retrieved
	return languagesData.output
		.map((value) => {
			// check that value is object
			const result = v.safeParse(languageSchema, value);
			if (result.success) {
				return result.output;
			} else {
				console.log(result);
				return undefined;
			}
		})
		.filter((value): value is Language => !!value);
}

// create async Provider
export const asyncProvider = new AsyncProvider(
	getLanguage,
	// language listCallback with custom data
	async () => await getLanguages()
);

/* export async function initLangProvider() {
	return await initAsyncLangProvider(async () =>
		(await getLanguages()).map((value) => value.tag)
	);
} */
