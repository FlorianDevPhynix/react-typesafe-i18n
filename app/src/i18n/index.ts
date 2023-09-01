import type {
	CacheEntry /* , i18nDefinition, Strict, NonStrict */,
} from 'react-typesafe-i18n';
import {
	i18nBuilder,
	//StaticProvider,
	Detector,
	LocalStorageDetector,
	NavigatorDetector,
} from 'react-typesafe-i18n';

import { Language, asyncProvider } from './async';

// import translation from component files
import { translation as home } from '../pages/Home';
import { translation as about } from '../pages/About';

// base
const base_translation = {
	home,
	about,
} as const;

export const base_language: CacheEntry<
	typeof base_translation,
	Omit<Language, 'code'>
> = {
	lang: 'en',
	langData: {
		name: 'English',
		direction: 'LTR' as const,
		icon: '',
	},
	translation: base_translation,
};
// base language when using static provider
/* export const base_language = {
	lang: 'en',
	langData: {
		name: 'English',
		direction: 'LTR' as const,
		icon: null as null | string,
	},
	translation: base_translation,
}; */

// Provider
/* import { lang as german } from './de';
import { lang as italian } from './it';
const provider = new StaticProvider([base_language, german, italian]); */

// type boilerplate for static languages
/* export type Definition<S extends boolean = false> = i18nDefinition<
	typeof base_translation,
	S
>;

export type NonStrictDefinition = NonStrict<typeof base_translation>;
export type StrictDefinition = Strict<typeof base_translation>;

export type Language = CacheEntry<
	Definition<false>,
	typeof base_language.langData
>; */

// create the builder
const builder = new i18nBuilder(base_language, asyncProvider);
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
