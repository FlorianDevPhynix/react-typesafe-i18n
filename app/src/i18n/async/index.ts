import type {
  Translation,
  i18nDefinition /*, Strict, NonStrict */,
} from 'react-safe-i18n';
import {
  i18nBuilder,
  Detector,
  LocalStorageDetector,
  NavigatorDetector,
} from 'react-safe-i18n';

import { Language, asyncProvider } from './async';

// import translation from component files
import { translation as home } from '../../pages/Home';
import { translation as about } from '../../pages/About';

// base
const base_translation = {
  home,
  about,
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

// type boilerplate for static languages
export type { Language };
export type Definition<S extends boolean = false> = i18nDefinition<
  typeof base_translation,
  S
>;

/* export type NonStrictDefinition = NonStrict<typeof base_translation>;
export type StrictDefinition = Strict<typeof base_translation>; */

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
