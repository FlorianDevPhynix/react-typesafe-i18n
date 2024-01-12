import type { Translation, LanguageData, Logger } from './types';
import { isTruthy, uniqueArray } from 'typesafe-utils'
import { parse, type ObjectType } from './parser';
import { Provider } from './providers';
import { LocaleDetector } from './detectors';

/**
 * Select the language from the cache based on the provided code or it's parts, and parse it.
 * @param code - The language code that is supposed to be selected.
 * @param base_lang - The Base language.
 * @param language_cache - List of languages with their translations.
 * @returns The language, if found, parsed against the base.
 * @throws If the code does not match any of the cached languages.
 */
export async function getLanguage<C extends string, D extends LanguageData, Base extends ObjectType>(
	code: C,
	base_lang: Translation<C, D, Base>,
	provider: Provider<C>,
	log: Logger
): Promise<Omit<Translation<C, D, Base>, 'direction' | 'langData'>> {
	// check language code
	const found = await provider.get(code, log);
	if (found === undefined) {
		log('unknown language code =', code);
	} else if (found !== null) {
		// parse translation
		return {
			code,
			translation: parse<Base>(base_lang.translation, found),
		};
	}

	return base_lang as unknown as Translation<C, D, Base>;
}

/** Copied from https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/detectors/src/detect.mts */
export async function detectLocale<C extends string>(
	baseLocale: C,
	availableLocales: C[],
	...detectors: LocaleDetector[]
): Promise<C> {
	for (const detector of detectors) {
		const found = await findMatchingLocale<C>(availableLocales, detector)
		if (found) return found
	}

	return baseLocale
}

/** Also copied from https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/detectors/src/detect.mts */
async function findMatchingLocale<C extends string>(availableLocales: C[], detector: LocaleDetector): Promise<C | undefined> {
	const detectedLocales = (await detector()).map((locale) => locale.toLowerCase())
	// also include locales without country code e.g. if only 'en-US' is detected, we should also look for 'en'
	const localesToMatch = uniqueArray(detectedLocales.flatMap((locale) => [locale, locale.split('-')[0]]))

	const lowercasedLocales = availableLocales.map((locale) => locale.toLowerCase())

	return localesToMatch
		.map((locale) => {
			const matchedIndex = lowercasedLocales.findIndex((l) => l === locale)
			return matchedIndex >= 0 && availableLocales[matchedIndex]
		})
		.find(isTruthy)
}

export type ExtendPromise<T> = {
	status: 'pending' | 'fulfilled' | 'rejected';
	value: T;
	reason: Error;
};

export function use<T>(inPromise: Promise<T>) {
	const promise = inPromise as Promise<T> & ExtendPromise<T>;
	if (promise.status === 'fulfilled') {
		return promise.value;
	} else if (promise.status === 'rejected') {
		throw promise.reason;
	} else if (promise.status === 'pending') {
		throw promise;
	} else {
		promise.status = 'pending';
		promise.then(
			(result) => {
				promise.status = 'fulfilled';
				promise.value = result;
			},
			(reason) => {
				promise.status = 'rejected';
				promise.reason = reason;
			}
		);
		throw promise;
	}
}
