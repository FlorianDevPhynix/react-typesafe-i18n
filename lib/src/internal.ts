import type { Translation, LanguageData, Logger } from './types';
import { parse, type ObjectType } from './parser';
import { Provider } from './providers';

/**
 * Select the language from the cache based on the provided code or it's parts, and parse it.
 * @param code - The language code that is supposed to be selected.
 * @param base_lang - The Base language.
 * @param language_cache - List of languages with their translations.
 * @returns The language, if found, parsed against the base.
 * @throws If the code does not match any of the cached languages.
 */
export async function getLanguage<
	C extends string,
	D extends LanguageData,
	Base extends ObjectType,
>(
	code: C | string,
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
		const newcode = code as C;
		return {
			code: newcode,
			translation: parse<Base>(base_lang.translation, found),
		};
	}

	return base_lang as unknown as Translation<C, D, Base>;
}

export * from './parser';
