import { Translation, LanguageData, Logger } from '../types';
import { LangListProvider, LangList } from './types';

export interface Provider<C extends string> {
	/**
	 * @returns the translation object, undefined when no language for the passed code or null on any other error
	 */
	get(
		code: C,
		log: Logger
	): Promise<object | null | undefined> | (object | null | undefined);

	//has(code: string): Promise<boolean> | boolean;

	//set(lang: CacheEntry<object>): void;
}

export class StaticProvider<L extends Translation<C, D, object>[], D extends LanguageData, C extends string = L[number]['code']>
	implements Provider<C>, LangListProvider<C, D>
{
	private cache: Map<string, object>;
	private langList: LangList<C, D>;

	constructor(languages: L) {
		this.cache = new Map<string, object>(
			languages.map((value) => [value.code, value.translation])
		);

		this.langList = languages.map((value) => {
			return {
				code: value.code,
				direction: value.direction,
				langData: value.langData
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LangCodes<
// eslint-disable-next-line @typescript-eslint/no-unused-vars
	S extends StaticProvider<L, D, C>,
	C extends string = string,
	D extends LanguageData = LanguageData,
	L extends Translation<C, D, object>[] = Translation<C, D, object>[]
> = C;
export type InferLangCodes<
	L extends Translation<C, D, object>[],
	D extends LanguageData = LanguageData,
	C extends string = L[number]['code']
> = C;

export * from './types';
export * from './async';
