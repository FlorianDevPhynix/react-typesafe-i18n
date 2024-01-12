import { BaseCacheEntry, Logger } from '../types';

export type CacheEntry<
	D,
	L extends {
		direction: Direction;
	},
> = BaseCacheEntry<D> & { langData: L };

export type Direction = 'LTR' | 'RTL';
export type PartialLangType = { code: string };
export type LanguageData = {
	direction: Direction;
	[x: string]: unknown;
};
export type LangList<L extends LanguageData> = (PartialLangType & L)[];

export interface LangListProvider<L extends LanguageData> {
	getLanguages(
		log: Logger
	): Promise<LangList<L> | undefined> | LangList<L> | undefined;
}
