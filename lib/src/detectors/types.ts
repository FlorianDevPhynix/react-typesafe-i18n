import type { Logger } from '../types';

export type LocaleDetector = () => string[];
export type LocaleSetter = (lang: string, log: Logger) => Promise<void> | void;

export type LocaleHandler = {
	detector: LocaleDetector;
	setter?: LocaleSetter;
};

/* export interface LanguageProvider {
	getLanguages(
		log: Logger
	): Promise<string[] | undefined> | string[] | undefined;
} */
