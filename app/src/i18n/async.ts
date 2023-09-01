import * as v from 'valibot';

import { AsyncProvider } from 'react-typesafe-i18n';

// language
export const languageSchema = v.object({
	code: v.string([v.minLength(2, 'language tag is too short')]),
	name: v.string([v.minLength(1, 'language name is empty')]),
	direction: v.enumType(['LTR', 'RTL']),
	icon: v.nullable(v.string()),
});
export type Language = v.Output<typeof languageSchema>;

export const languageListSchema = v.array(v.record(v.unknown()), [
	v.minLength(1, 'The language array is empty'),
]);

// translations
export const translationSchema = v.record(v.unknown());

/* export const translationsSchema = v.array(translationSchema, [
	v.minLength(1, 'The translations array is empty'),
]); */

// fetcher
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

	const languagesData = v.safeParse(languageListSchema, data);
	if (!languagesData.success) return [];

	return languagesData.output
		.map((value) => {
			const result = v.safeParse(languageSchema, value);
			if (result.success) {
				return result.data;
			} else {
				console.log(result.error);
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
