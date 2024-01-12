import { LocaleHandler, LocaleDetector, LocaleSetter } from './types';
import { LangListProvider } from '../providers';
import { LanguageData, type Logger } from '../types';
import { detectLocale } from '../utility';

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

export * from './types';
export * from './document-cookie';
export * from './localstorage';
export * from './sessionstorage';
export * from './navigator';
