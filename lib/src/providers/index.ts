import { Translation, LanguageData, Logger } from '../types';
import { LangListProvider, LangList } from './types';

export interface Provider<C extends string> {
	/**
	 * @returns the translation object, undefined when no language for the passed code or null on any other error
	 */
	get(
		code: C | string,
		log: Logger
	): Promise<object | null | undefined> | (object | null | undefined);

	//has(code: string): Promise<boolean> | boolean;

	//set(lang: CacheEntry<object>): void;
}

export class StaticProvider<D extends LanguageData, C extends string>
	implements Provider<C>, LangListProvider<C, D>
{
	private cache: Map<string, object>;
	private langList: LangList<C, D>;

	constructor(languages: Translation<C, D, object>[]) {
		this.cache = new Map<string, object>(
			languages.map((value) => [value.code, value.translation])
		);

		this.langList = languages.map((value) => {
			return {
				code: value.code,
				direction: value.direction,
				langData: value.langData,
			};
		});
	}

	public get(code: C) {
		return this.cache.get(code);
	}

	public set(lang: Translation<C, D, object>) {
		this.cache.set(lang.code, lang.translation);
	}

	/* getLanguages(): string[] {
		return [...this.cache.keys()];
	} */

	getLanguages() {
		return this.langList;
	}
}

/**
 * Type helper to extract the language codes as a type
 * @example
 * ```
 * const langlist = [base_language, ...];
 *
 * const provider = new StaticProvider<
 * 	typeof base_language.langData,
 * 	InferLangCodes<typeof langlist>
 * >(langlist);
 * ```
 */
export type InferLangCodes<
	L extends Translation<C, D, object>[],
	D extends LanguageData = LanguageData,
	C extends string = L[number]['code'],
> = C;

export * from './types';
export * from './async';
