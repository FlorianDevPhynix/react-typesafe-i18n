import { BaseCacheEntry, Logger } from '../types';
import { CacheEntry, LangListProvider, LangList, LanguageData } from './types';

export interface Provider {
	/**
	 * @returns the translation object, undefined when no language for the passed code or null on any other error
	 */
	get(
		code: string,
		log: Logger
	): Promise<object | null | undefined> | (object | null | undefined);

	//has(code: string): Promise<boolean> | boolean;

	//set(lang: CacheEntry<object>): void;
}

export class StaticProvider<L extends LanguageData>
	implements Provider, LangListProvider<L>
{
	private cache: Map<string, object>;
	private langList: LangList<L>;

	constructor(languages: CacheEntry<object, L>[]) {
		this.cache = new Map<string, object>(
			languages.map((value) => [value.lang, value.translation])
		);

		this.langList = languages.map((value) => {
			return { code: value.lang, ...value.langData };
		});
	}

	public get(code: string) {
		return this.cache.get(code);
	}

	public set(lang: BaseCacheEntry<object>) {
		this.cache.set(lang.lang, lang.translation);
	}

	/* getLanguages(): string[] {
		return [...this.cache.keys()];
	} */

	getLanguages() {
		return this.langList;
	}
}

export * from './types';
export * from './async';
