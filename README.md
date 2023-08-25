# React Typesafe i18n

A typesafe translation library that uses a base translation to achieve full safety in the React UI.

**Still very much WIP.**

# Usage

Create an i18n folder in the `src` directory of your project.
All the Boilerplate will be contained in the `i18n/index.ts` file.

Here's an example with a Static Language Provider:

```ts
import type { CacheEntry, i18nDefinition, Strict, NonStrict } from 'react-typesafe-i18n';
import {
	i18nBuilder,
	StaticProvider,
	Detector,
	LocalStorageDetector,
	NavigatorDetector,
} from 'react-typesafe-i18n';

// components
import { translation as home } from '../pages/Home';
import { translation as about } from '../pages/About';

// base
const base_translation = {
	home,
	about,
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
```

Import the `I18nProvider` in your root React entry file and wrap your app in it.

```ts
import React from 'react';
import ReactDOM from 'react-dom/client';

import I18nProvider from './i18n';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
```

Now you can use the translations in your components and even define their translation besides them.

```ts
import { useLanguage, useTranslation } from '../i18n';

export const translation = {
	count: 'count is: ',
	tip: 'Edit <code>src/App.tsx</code> and save to test HMR',
	docs: 'Click on the Vite and React logos to learn more',
} as const;


export default function Home() {
  const t = useTranslation();
  const [l, f] = useLanguage();

  const [count, setCount] = useState(0);

  t.test();
  return ( <>
    <h1>Home</h1>
    <div className="card">
      <button onClick={() => setCount((count) => count + 1)}>
        {t.home.count()} {count}
      </button>
      <p>{t.home.tip()}</p>
    </div>
    <p className="read-the-docs">{t.home.docs()}</p>
    {l}
    <br></br>
    <button onClick={() => f.switchLang('de')}>German</button>
    <button onClick={() => f.switchLang('it')}>Italian</button>
    <button onClick={() => f.resetLang()}>Reset</button>
  </> );
}
```

## Static Provider

All the languages and translations need to be available when creating the `StaticProvider`.

Here's an example of how to statically include languages in your app.

> Note that `Definition` enables typesafety for this translation definition. The type parameter can be set to true to have typescript check for missing translations.

```ts
import { Language, Definition } from './index';

const translation: Definition<false> = {
  home: {
    count: 'Die aktuelle Zählung ist: ',
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
  translation,
} as const;
```

> These translations can also be dynamically fetched before the creation of this Provider. This though, will block the whole app from rendering. It is recommended to use [HTML preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) to speed up the page load.

## Async Provider

Asynchronously fetching languages and translations is only possible with the `AsyncProvider`. It will cache all languages and load new ones when required.

```ts
import { AsyncProvider, initAsyncLangProvider } from 'react-typesafe-i18n';

export const asyncProvider = new AsyncProvider(async (lang) => fetchlanguage(lang));

// list of possible language codes (string[])
export const asyncLang = await initAsyncLangProvider(fetchLanguageCodes());
```

## Preload

Asynchronously loading translation data can significantly increase time until First Contentful Paint.
It is recommended to use [HTML preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) to speed up the page load.

```html
<head>
  <link rel="preload" href="/common-i18n/rest/translations/common/availableLanguages" as="fetch" crossorigin="anonymous">
</head>
```

## Example

For a full example see the test app [here](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/app)

## Original Development

[Stackblitz Sandbox](https://stackblitz.com/edit/react-custom-i18n?file=src%2FApp.tsx)
