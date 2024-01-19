import type {
	Translation,
	InferLangCodes,
	i18nDefinition,
	Strict,
	NonStrict,
} from 'react-safe-i18n';
import {
	i18nBuilder,
	StaticProvider,
	Detector,
	LocalStorageDetector,
	NavigatorDetector,
} from 'react-safe-i18n';

// import translation from component files
import { translation as home } from '../../pages/Home';
import { translation as about } from '../../pages/About';

// base
export const base_translation = {
	home,
	about,
} as const;

// base language
export const base_language = {
	code: 'en' as const,
	direction: 'ltr' as const,
	langData: {
		name: 'English',
		icon: undefined as undefined | null | string,
	},
	translation: base_translation,
};

// create Provider with all languages
import { lang as german } from './de';
import { lang as italian } from './it';
import { lang as arabic } from './ar';
const langlist = [base_language, german, italian, arabic];
export type Codes = InferLangCodes<typeof langlist>;
const provider = new StaticProvider<typeof base_language.langData, Codes>(
	langlist
);

// type boilerplate for static languages
export type Definition<S extends boolean = false> = i18nDefinition<
	typeof base_translation,
	S
>;
export type NonStrictDefinition = NonStrict<typeof base_translation>;
export type StrictDefinition = Strict<typeof base_translation>;

// type for each language
export type Language = Translation<
	string,
	typeof base_language.langData,
	Definition
>;

// create the builder
import { initFormatters } from './formatters';
const builder = new i18nBuilder(base_language, provider).addFormatterInit(
	initFormatters
);
builder.addDefault('en');

// data received from builder in the async init function available through export
type BuildResult = Awaited<ReturnType<typeof builder.build>>;
let useTranslation: BuildResult['useTranslation'];
let useLanguage: BuildResult['useLanguage'];
let languages: BuildResult['languages'];

// build the Provider component and utility hooks
// returns Provider because it is only needed in react root
export default async function initI18n() {
	// add a detector
	builder.addDetector(
		new Detector(LocalStorageDetector(), [NavigatorDetector().detector])
	);

	const result = await builder.build();
	useTranslation = result.useTranslation;
	useLanguage = result.useLanguage;
	languages = result.languages;

	return result.I18nProvider;
}

export { useTranslation, useLanguage, languages };
