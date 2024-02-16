import {
	type Translation,
	i18nBuilder,
	Detector,
	LocalStorageDetector,
	NavigatorDetector,
} from 'react-safe-i18n';

import { Language, asyncProvider } from './async';

// import translation from component files
import { translation as home } from '../../pages/Home';
import { translation as about } from '../../pages/About';
import { translation as renderer } from '../../pages/Renderer';
import { translation as nested } from '../../pages/Nested';
import { translation as formatters } from '../../pages/Formatters';

// base
const base_translation = {
	home,
	about,
	renderer,
	nested,
	formatters,
} as const;

export const base_language: Translation<
	string,
	Language['langData'],
	typeof base_translation
> = {
	code: 'en',
	direction: 'ltr',
	langData: {
		name: 'English',
		icon: undefined,
	},
	translation: base_translation,
};

// create the builder
import { initFormatters } from './formatters';
const builder = new i18nBuilder(base_language, asyncProvider).addFormatterInit(
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
