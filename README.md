# React Safe i18n

A typesafe [Internationalization](#more-information-on-internationalization) library that uses a base translation, as a fallback with a custom parser, to achieve full safety in the React UI.

Even when no translation data can be asynchonously aquired, so a connection to some kind of backend is not possibel, then the React UI can still render without having a bunch of undefined values.

## Features

- A default language can be set to allow changing the translation of the default language **after deployment**
- **Async Provider** that can load translations from any asynchronous source
- *Detector* that handles detecting and setting of the users selected language
  - can be configured with *fallback methods*
  - even allows the users selected language to be **fetched from a network source** using a custom Detector
  - *common methods* of detecting the users language available packaged with library
- **fully typesafe formatting/templating** ([Syntax](#formattingtemplating-syntax)) in the translations thanks to [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)
- Formatter functions compatible with [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)

## Example

For a full example see this [Sandbox](https://stackblitz.com/edit/react-typesafe-i18n-example) or the projects development app [here](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/app).

## Roadmap

**Translations are strings, so rendering React Components in them is currently not supported!**
Something similar to [this](https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/adapter-react/README.md#recipes)
will be implemented in the future.

- [x] React element for setting the lang attribute on the html tag
- [x] formatter user setting ...
- [x] add more tests
- [ ] utility for react components in translations ([react in translation: recipe](https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/adapter-react/README.md#recipes))
- [ ] Custom lang resolve algorithm (Detector)
- [ ] Support for suspense and showing error message when async lang loading failed: error messages will be static translations, shown in users selected language
- [ ] Add more formatters & utilitys

## Usage

Most of the configuration and Boilerplate can be contained in a single file.

### Installation

```sh
npm install react-safe-i18n
pnpm add react-safe-i18n
```

### Providers

Based on your use case either the [Static](#static-provider) or [Async](#async-provider) Provider
should be sufficient enough to get you started.

#### Static Provider

> All the languages and translations need to be available when creating the `StaticProvider`.

Here's an example configuration to statically include languages in your app.

```ts
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
import { translation as home } from '../pages/Home';

// english translation included in react app bundle
const base_translation = {
  home,
} as const; // all base translations need to be const
// this is needed to achieve typesafety of the formatting input arguments

// english language with language data, use to create types for the other static translations
export const base_language = {
  code: 'en' as const,
  direction: 'ltr' as const,
  langData: {
    name: 'English',
    icon: undefined as undefined | null | string,
  },
  translation: base_translation,
};

import { lang as german } from './de';
import { lang as italian } from './it';
import { lang as arabic } from './ar';
// build list of languages and infer the language codes from them
const langlist = [base_language, german, italian, arabic];
export type Codes = InferLangCodes<typeof langlist>;
// create the Static Provider with all languages
const provider = new StaticProvider<typeof base_language.langData, Codes>(
  langlist
);

// type boilerplate for the static definitions of other languages
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
const builder = new i18nBuilder(base_language, provider);
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
```

Here's an example of another language that is statically included in your application.

> Note that `Definition` enables typesafety for this translation definition. The type parameter can be set to true to have typescript check for missing translations.

```ts
import { Language, Definition } from './index';

const translation: Definition<false> = {
  home: {
    hello: 'Hallo: {name:string}!',
  },
};

export const lang: Language = {
  lang: 'de' as const,
  direction: 'ltr',
  langData: {
    name: 'Deutsch',
  },
  translation,
} as const;
```

> These translations can also be dynamically fetched before the creation of this Provider. This though, will block the whole app from rendering. It is recommended to use [HTML preload](#preload) to speed up the page.

#### Async Provider

Asynchronously fetching languages and translations is only possible with the `AsyncProvider`. It will cache all languages and load new ones when required.

> A more thorough example can be found in the Test App's ["async.ts"](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/app/src/i18n/async/async.ts) file.

To create an `AsyncProvider` you will have to implement two functions and provide them to it.

- The first parameter function is expected to load a language based on it's short code. The result can be any string indexed object, the parser will do the rest.

- The second parameter function needs to return a list of all available languages, this data will be used to load any of those languages.
It is recommended to use one of the many validation librarys to check all of these language entrys.
The example at ["async.ts"](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/app/src/i18n/async/async.ts)
uses valibot but also does some custom validation on the list to ensure that all languages that are valid will be available.

Also take a look at the types, to see how this data is structured. There also is a property of type `Record<string, unkown>` on these Language entrys,
called langData that allows you to store additional data for each language.

```ts
import { AsyncProvider } from 'react-typesafe-i18n';

// create the async Provider
export const asyncProvider = new AsyncProvider(
  getLanguage,
  // language listCallback with custom data
  async () => await getLanguages()
);
```

Here's a full example configuration.

```ts
import {
  type Translation,
  i18nBuilder,
  Detector,
  LocalStorageDetector,
  NavigatorDetector,
} from 'react-typesafe-i18n';

import { Language, asyncProvider } from './async';

// import base translation from component files
import { translation as home } from '../pages/Home';

// base
const base_translation = {
  home,
} as const; // all base translations need to be const
// this is needed to achieve typesafety of the formatting input arguments

export const base_language: Translation<
  string,
  // infer type from validation done when it is received from an async request
  Language['langData'],
  typeof base_translation
> = {
  lang: 'en',
  direction: 'ltr',
  langData: {
    name: 'English',
  },
  translation: base_translation,
};

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
  // add a detector and fallbacks
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
```

### Use in React Components

To be able to use the Hooks created by the *Builder*,
you will have to import the *Provider* into your root component
and wrap your app inside of it.

```ts
import React from 'react';
import ReactDOM from 'react-dom/client';

import init from './i18n';

import App from './App';

// the builder is async, this does not affect the react app in any way
(async () => {
  const I18nProvider = await init();

  // will be created after the translations are ready
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </React.StrictMode>
  );
})();
```

Now you can use the translations in your components
and even define their specific translations besides them.

```tsx
// example component
import { useLanguage, useTranslation, languages } from '../i18n';
import { LanguageIcon } from './icon';

// translations can also be located directly besides the component
export const translation = {
  hello: 'Hello: {name:string}!', // example use of templating
} as const;

export default function Home() {
  // hook to access the current translation
  const t = useTranslation();
  // get the current language code, direction and function object
  const { lang, direction, func: f } = useLanguage();

  // get the data of the current language
  const language = useMemo(() => {
    return languages.find((value) => value.code == lang);
  }, [lang]);

  const [name, setName] = useState("World");

  return (
    <>
      <h1>{t.home.hello({ name })}</h1>
      <input value={name} onChange={e => setName(e.target.value)} />

      {/* select language switcher */}
      <label htmlFor="language">
        <LanguageIcon/>
      </label>
      <select
        id="language"
        dir={direction}
        onChange={(e) => func.switchLang(e.target.value)}
        value={language?.code}
      >
        {languages.map((value) => (
          <option value={value.code} lang={value.code}>
            {value.langData.name}
          </option>
        ))}
      </select>
  </> );
}
```

### Direction & Document language

It is [recommended](https://www.w3.org/International/techniques/authoring-html#language) by [The World Wide Web Consortium (W3C)](https://www.w3.org)
to set the language using attributes on the root html tag. This can be easily acchieved by adding the *LangHtmlComponent* of this library in your root *"main.tsx"*, *"index.tsx"* or other *root* component.

```tsx
import { LangHtmlComponent } from 'react-safe-i18n';
import init from './i18n';
import { useLanguage } from './i18n';

(async () => {
  const I18nProvider = await init();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <I18nProvider>
        {/* will change the documents html tag */}
        <LangHtmlComponent hook={useLanguage} />
        <App />
      </I18nProvider>
    </React.StrictMode>
  );
})();
```

### Formatting/Templating Syntax

See [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)'s documentation for it's syntax, [Here](https://github.com/ivanhofer/typesafe-i18n/tree/318c9042fddf179bde6775bbead9a37fc557ad2a/packages/runtime#syntax).

This is extendable by writing formatters

```ts
import {
  type BaseFormatters,
  date,
  replace,
  lowercase,
} from 'react-safe-i18n/formatters';

export function initFormatters(locale: string) {
  return {
    round: (value) => Math.round(value),
    weekday: date(locale, { weekday: 'long' }),
    myFormatter: locale === 'en' ? identity : ignore,
    noSpaces: replace(/\s/g, '-'),
    lower: lowercase,
  } satisfies BaseFormatters;
}
```

and providing them to the builder like this

```ts
const builder = new i18nBuilder(base_language, asyncProvider).addFormatterInit(
  initFormatters
)
```

All available formatters:

```ts
import {
  date,
  identity,
  ignore,
  lowercase,
  number,
  replace,
  time,
  uppercase,
} from 'react-safe-i18n/formatters';
```

Here's the [Documentation for Custom Formatters](https://github.com/ivanhofer/typesafe-i18n/tree/318c9042fddf179bde6775bbead9a37fc557ad2a/packages/formatters#typesafe-i18n-formatters)
and some more [Example](https://github.com/ivanhofer/typesafe-i18n/blob/318c9042fddf179bde6775bbead9a37fc557ad2a/packages/formatters/example/src/i18n/formatters.ts)

## More Information on Internationalization

- [Short Summarization](https://web.dev/learn/design/internationalization/)
- [W3C Internationalization techniques: Authoring web pages](https://www.w3.org/International/techniques/authoring-html)
- [Arabic numerals](https://en.wikipedia.org/wiki/Arabic_numerals#Comparison_with_other_digits)

## Preload

Asynchronously loading translation data can (*significantly*) increase time until First Contentful Paint.
For big translations, it is recommended to use [HTML preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) to speed up the page load.

```html
<head>
  <!-- preload list of languages -->
  <link rel="preload" href="/rest/localization/languages" as="fetch" crossorigin="anonymous">
  <!-- preload default language (if needed) -->
  <link rel="preload" href="/rest/localization/translations?lang=en" as="fetch" crossorigin="anonymous">
</head>
```

## Original Development

This is the [Stackblitz Sandbox](https://stackblitz.com/edit/react-custom-i18n?file=src%2FApp.tsx) the development was started in. I tried to achieve my idea using zod but it did not work like I wanted it to, so I wrote the parse.
