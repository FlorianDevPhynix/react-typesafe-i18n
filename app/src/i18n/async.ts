import * as v from 'valibot';

import { AsyncProvider, initAsyncLangProvider } from '@/lib';

// language
export const languageSchema = v.object({
	tag: v.string([v.minLength(2, 'language tag is too short')]),
	name: v.string([v.minLength(1, 'language name is empty')]),
	translatedName: v.string(),
	nativeName: v.string([v.minLength(1, 'native language name is empty')]),
	direction: v.enumType(['LTR', 'RTL']),
	icon: v.nullable(v.string()),
	/* .transform(( arg, ctx ) => {
    if( typeof arg !== 'string' ) return;

    const img = new Image()
    img.
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
    reader.

    ctx.addIssue({
      code: v.ZodIssueCode.custom,
      message: "Language icon is not a valide base64 encoded image",
    });
  }) */
});
export type Language = v.Output<typeof languageSchema>;

export const languageListSchema = v.array(v.record(v.unknown()), [
	v.minLength(1, 'The language array is empty'),
]);

// translations
export const translationSchema = v.object({
	version: v.number(),
	checksum: v.nullable(v.string()),
	name: v.string([v.minLength(1, 'resource name is empty')]),
	language: languageSchema,
	translations: v.object({}),
});

export const translationsSchema = v.array(translationSchema, [
	v.minLength(1, 'The translations array is empty'),
]);

// fetcher
export async function lang_rest_fetch(path: string) {
	const result = await fetch(`/common-i18n/rest/${path}`);
	return result.json();
}

/**
 * fetch ALL the languages with their translations for a specific resource
 * @param resourceName name of the resource to load
 * @returns a Promise with the received json data
 */
export function fetch_translation(resourceName: string) {
	return Promise.race([
		new Promise((_, reject) => {
			setTimeout(() => {
				//console.log("timeout")
				reject('timeout');
			}, 10 * 1000);
		}),
		lang_rest_fetch(`translations/${resourceName}`),
	]);
}

async function get_availableLanguages() {
	const data = await lang_rest_fetch(
		'translations/common/availableLanguages' // /test
	);

	const languagesData = v.safeParse(languageListSchema, data);
	if (!languagesData.success) return [];

	return languagesData.data
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

// async Provider
export const asyncProvider = new AsyncProvider(async (lang) =>
	(await get_availableLanguages()).find((value) => value.tag === lang)
);
export const asyncLang = await initAsyncLangProvider(async () =>
	(await get_availableLanguages()).map((value) => value.tag)
);

//const common = await fetch_translation( "common" )
//const list = translationsSchema.parse( common )
