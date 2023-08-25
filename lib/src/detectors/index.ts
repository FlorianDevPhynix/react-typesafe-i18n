import {
	LocaleHandler,
	LocaleDetector,
	LocaleSetter,
	LanguageProvider,
} from './types';
import { detectLocale } from 'typesafe-i18n/detectors';

export class Detector {
	private detectors: LocaleDetector[];
	private setter: LocaleSetter | undefined;

	constructor(
		private langProvider: LanguageProvider,
		handler: LocaleHandler,
		fallback?: LocaleDetector[]
	) {
		this.detectors =
			fallback === undefined
				? [handler.detector]
				: [handler.detector, ...fallback];
		this.setter = handler.setter;
	}

	public get(base: string): string {
		return detectLocale(
			base,
			this.langProvider.getLang(),
			...this.detectors
		);
	}

	public set(lang: string) {
		this.setter?.(lang);
	}
}

export * from './types';
export * from './document-cookie';
export * from './localstorage';
export * from './sessionstorage';
export * from './navigator';
