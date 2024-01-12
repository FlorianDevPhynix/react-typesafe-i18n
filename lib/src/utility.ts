import type { BaseCacheEntry, Logger } from './types';
import { parse, ObjectType } from './parser';
import { Provider } from './providers';

/**
 * Select the language from the cache based on the provided code or it's parts, and parse it.
 * @param code - The language code that is supposed to be selected.
 * @param base_lang - The Base language.
 * @param language_cache - List of languages with their translations.
 * @returns The language, if found, parsed against the base.
 * @throws If the code does not match any of the cached languages.
 */
export async function getLanguage<Base extends ObjectType>(
	code: string,
	base_lang: BaseCacheEntry<Base>,
	provider: Provider,
	log: Logger
): Promise<BaseCacheEntry<Base>> {
	// check language code
	const found = await provider.get(code, log);
	if (found === undefined) {
		log('unknown language code =', code);
	} else if (found !== null) {
		// parse translation
		return {
			lang: code,
			translation: parse<Base>(base_lang.translation, found),
		};
	}

	return base_lang as unknown as BaseCacheEntry<Base>;
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
