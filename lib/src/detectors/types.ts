export type LocaleDetector = () => string[];
export type LocaleSetter = (lang: string) => Promise<void> | void;

export type LocaleHandler = {
	detector: LocaleDetector;
	setter?: LocaleSetter;
};

export interface LanguageProvider {
	getLang(): string[];
}
