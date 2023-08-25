import type { CacheEntry, i18nDefinition, Strict, NonStrict } from '@/lib';
import {
	i18nBuilder,
	StaticProvider,
	Detector,
	LocalStorageDetector,
	NavigatorDetector,
} from '@/lib';

//import { asyncLang, asyncProvider } from './async';

// components
import { translation as home } from '../pages/Home';
import { translation as about } from '../pages/About';

// base
const base_translation = {
	home,
	about,
	test: 'shared test value {0}',
} as const;

export const base_language: CacheEntry<typeof base_translation> = {
	lang: 'en',
	translation: base_translation,
};

// Provider
import { lang as german } from './de';
import { lang as italian } from './it';
const provider = new StaticProvider([base_language, german, italian]);

// type boilerplate
export type Definition<S extends boolean = false> = i18nDefinition<
	typeof base_translation,
	S
>;

export type NonStrictDefinition = NonStrict<typeof base_translation>;
export type StrictDefinition = Strict<typeof base_translation>;

export type Language = CacheEntry<Definition<false>>;

// create the builder and add a detector
const builder = new i18nBuilder(base_language, provider);
builder.add_detector(
	new Detector(provider, LocalStorageDetector(), [
		NavigatorDetector().detector,
	])
);

// build the Provider component and utility hooks
const { I18nProvider, useTranslation, useLanguage } = await builder.build();
export default I18nProvider; // Provider only needed in react root
export { useTranslation, useLanguage };
