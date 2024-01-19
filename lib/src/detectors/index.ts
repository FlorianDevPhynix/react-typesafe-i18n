import { isTruthy, uniqueArray } from 'typesafe-utils';

import { LocaleHandler, LocaleDetector, LocaleSetter } from './types';
import { LangListProvider } from '../providers';
import { LanguageData, type Logger } from '../types';

export class Detector<C extends string, D extends LanguageData> {
	private detectors: LocaleDetector[];
	private setter: LocaleSetter | undefined;

	constructor(handler: LocaleHandler, fallback?: LocaleDetector[]) {
		this.detectors =
			fallback === undefined
				? [handler.detector]
				: [handler.detector, ...fallback];
		this.setter = handler.setter;
	}

	public async get(
		base: C,
		langProvider: LangListProvider<C, D>,
		log: Logger
	): Promise<C> {
		const languages = (await langProvider.getLanguages(log))?.map(
			(value) => value.code
		);
		return detectLocale(base, languages ?? [base], ...this.detectors);
	}

	public set(lang: C, log: Logger) {
		this.setter?.(lang, log);
	}
}

/**
 * Copied from https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/detectors/src/detect.mts
 * changed to async
 */
export async function detectLocale<C extends string>(
	baseLocale: C,
	availableLocales: C[],
	...detectors: LocaleDetector[]
): Promise<C> {
	for (const detector of detectors) {
		const found = await findMatchingLocale<C>(availableLocales, detector);
		if (found) return found;
	}

	return baseLocale;
}

/**
 * Copied from https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/detectors/src/detect.mts
 * changed to async
 */
async function findMatchingLocale<C extends string>(
	availableLocales: C[],
	detector: LocaleDetector
): Promise<C | undefined> {
	const detectedLocales = (await detector()).map((locale) =>
		locale.toLowerCase()
	);
	// also include locales without country code e.g. if only 'en-US' is detected, we should also look for 'en'
	const localesToMatch = uniqueArray(
		detectedLocales.flatMap((locale) => [locale, locale.split('-')[0]])
	);

	const lowercasedLocales = availableLocales.map((locale) =>
		locale.toLowerCase()
	);

	return localesToMatch
		.map((locale) => {
			const matchedIndex = lowercasedLocales.findIndex(
				(l) => l === locale
			);
			return matchedIndex >= 0 && availableLocales[matchedIndex];
		})
		.find(isTruthy);
}

export * from './types';
export * from './document-cookie';
export * from './localstorage';
export * from './sessionstorage';
export * from './navigator';
