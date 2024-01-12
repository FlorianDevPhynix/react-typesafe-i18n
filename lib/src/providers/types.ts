import { Language, LanguageData, Logger } from '../types';

export type LangList<C extends string, D extends LanguageData> = Language<C, D>[];

export interface LangListProvider<C extends string, D extends LanguageData> {
	getLanguages(
		log: Logger
	): Promise<LangList<C, D> | undefined> | LangList<C, D> | undefined;
}
