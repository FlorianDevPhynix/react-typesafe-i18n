# React Typesafe i18n

A typesafe translation library that uses a base translation to achieve full safety in the React UI.
Thanks to [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) formatting/templating
in the translations is fully typesafe ([Syntax](#formattingtemplating-syntax)).

**Translations are strings, so rendering React Components in them is currently not supported!**
Something similar to [this](https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/adapter-react/README.md#recipes)
will be implemented in the future.

## Usage

It is recommended to put all translation code into a i18n folder in the `src` directory of your project.
All the configuration and Boilerplate can be contained in the `i18n/index.ts` file.

Based on your use case either the [Static](#static-provider) or [Async](#async-provider) Provider
should be sufficient enough to get you started.

## Static Provider

> All the languages and translations need to be available when creating the `StaticProvider`.

Here's an example configuration to statically include languages in your app.

```ts
import type { CacheEntry, i18nDefinition, Strict, NonStrict } from 'react-typesafe-i18n';
import {
  i18nBuilder,
  StaticProvider,
  Detector,
  LocalStorageDetector,
  NavigatorDetector,
} from 'react-typesafe-i18n';

// import translation from component files
import { translation as home } from '../pages/Home';
import { translation as about } from '../pages/About';

// base
const base_translation = {
  home,
  about,
} as const; // all base translations need to be const
// this is needed to achieve typesafety of the formatting input arguments

export const base_language = {
  lang: 'en',
  langData: {
    name: 'English',
    direction: 'LTR' as const,
    icon: null as null | string,
  },
  translation: base_translation,
};

// create the Static Provider
import { lang as german } from './de';
import { lang as italian } from './it';
const provider = new StaticProvider([base_language, german, italian]);

// type boilerplate for the static definitions of other languages
export type Definition<S extends boolean = false> = i18nDefinition<
  typeof base_translation,
  S
>;

export type NonStrictDefinition = NonStrict<typeof base_translation>;
export type StrictDefinition = Strict<typeof base_translation>;

export type Language = CacheEntry<Definition<false>, typeof base_language.langData>;

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
    count: 'Die aktuelle Zählung ist: {count:number}!',
    tip: 'Bearbeiten Sie src/App.tsx und speichern Sie es, um HMR zu testen',
    docs: 'Klicken Sie auf die Vite- und React-Logos, um mehr zu erfahren',
  },
  about: {
    title: 'Über die Seite',
  },
  test: 'Test Wert',
};

export const lang: Language = {
  lang: 'de',
  langData: {
    name: 'Deutsch',
    direction: 'LTR',
    icon: null,
  },
  translation,
} as const;
```

> These translations can also be dynamically fetched before the creation of this Provider. This though, will block the whole app from rendering. It is recommended to use [HTML preload](#preload) to speed up the page.

## Async Provider

Asynchronously fetching languages and translations is only possible with the `AsyncProvider`. It will cache all languages and load new ones when required.

> A more thorough example with validation of the loaded translations can be found in the Test App's [async.ts](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/app/src/i18n/async.ts) file.

```ts
import { AsyncProvider } from 'react-typesafe-i18n';

// create the async Provider
export const asyncProvider = new AsyncProvider(
  getLanguage,
	// language listCallback with custom data
  async () => await getLanguages()
);
```

Here's a full example.

```ts
import {
  type CacheEntry,
  i18nBuilder,
  StaticProvider,
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
  test: 'shared test value {0}',
} as const; // all base translations need to be const
// this is needed to achieve typesafety of the formatting input arguments

const langData = {
  name: 'English',
};

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

## Use in React Components

To be able to use the Hooks created by the *Builder*,
you will have to import the *Provider* into your root component
and wrap your app inside of it.

```ts
import React from 'react';
import ReactDOM from 'react-dom/client';

import init from './i18n';

import App from './App';

(async () => {
  // the builder is async, this does not affect the react app in any way
  const I18nProvider = await init();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <React.Suspense fallback={<h2>Loading...</h2>}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </React.Suspense>
    </React.StrictMode>
  );
})();
```

Now you can use the translations in your components
and even define their specific translations besides them.

```ts
import { useLanguage, useTranslation, languages } from '../i18n';

export const translation = {
  count: 'count is: {count:number}!', // example use of templating
  tip: 'Edit <code>src/App.tsx</code> and save to test HMR',
  docs: 'Click on the Vite and React logos to learn more',
} as const;

export default function Home() {
  const t = useTranslation();
  const { lang, direction, func: f } = useLanguage();

  const [count, setCount] = useState(0);

  t.test();
  return ( <>
    <h1>Home</h1>    
    <div className="card">
      <button onClick={() => setCount((count) => count + 1)}>
        {t.home.count({ count })}
      </button>
      <p>{t.home.tip()}</p>
    </div>
    <p className="read-the-docs">{t.home.docs()}</p>
    {lang} {direction}
    <div>
      {languages.map((value) => (
        <button
          onClick={() => f.switchLang(value.code)}
          key={value.code}
        >
          {value.name}
        </button>
      ))}
      <button onClick={() => f.resetLang()}>Reset</button>
    </div>
  </> );
}
```

## Formatting/Templating Syntax

See [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)'s documentation for it's syntax, [Here](https://github.com/ivanhofer/typesafe-i18n/tree/main/packages/runtime#syntax).

## Preload

Asynchronously loading translation data can significantly increase time until First Contentful Paint.
For big translation, it is recommended to use [HTML preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) to speed up the page load.

```html
<head>
  <link rel="preload" href="/common-i18n/rest/translations/common/availableLanguages" as="fetch" crossorigin="anonymous">
</head>
```

## Example

For a full example see this [Sandbox](https://stackblitz.com/edit/react-typesafe-i18n-example) or the projects test app [here](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/app).

## Original Development

This is the [Stackblitz Sandbox](https://stackblitz.com/edit/react-custom-i18n?file=src%2FApp.tsx) the development was started in. I tried to achieve my idea using zod but it did not work like I wanted it to, so I wrote the parse.
