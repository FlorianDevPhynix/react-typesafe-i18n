import { LocaleHandler, LocaleDetector, LocaleSetter } from './types';
import { LangListProvider, LanguageData } from '../providers';
import { type Logger } from '../types';
import { detectLocale } from 'typesafe-i18n/detectors';

export class Detector {
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
		base: string,
		langProvider: LangListProvider<LanguageData>,
		log: Logger
	): Promise<string> {
		const languages = (await langProvider.getLanguages(log))?.map(
			(value) => value.code
		);
		return detectLocale(base, languages ?? [base], ...this.detectors);
	}

	public set(lang: string, log: Logger) {
		this.setter?.(lang, log);
	}
}

export * from './types';
export * from './document-cookie';
export * from './localstorage';
export * from './sessionstorage';
export * from './navigator';
