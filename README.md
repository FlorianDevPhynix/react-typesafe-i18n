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
- Safe Html parser and RendererComponent that can render React Elements from Translations or any string
- **fully typesafe formatting/templating** ([Syntax](#formattingtemplating-syntax)) in the translations thanks to [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)
- Formatter functions compatible with [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)

## Example

For a full example see this [Sandbox](https://stackblitz.com/edit/react-safe-i18n-example) or the projects development app [here](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/app).

## Roadmap

**Translations are strings, so rendering React Components in them is currently not supported!**
Something similar to [this](https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/adapter-react/README.md#recipes)
will be implemented in the future.

- [x] React element for setting the lang attribute on the html tag
- [x] formatter user setting ...
- [x] add more tests
- [x] utility for React Components in Translations ([React in Translation: recipe](https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/adapter-react/README.md#recipes))
- [ ] v2 - complete rethinking of language & translation loading process (see [image](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/docs/i18n-data-loading.jpg))
  - [ ] restructure into Core and React to allow adding other frameworks in the future
  - [ ] React Component Render mode: wait(render after loading) or lazy(pop in of new translations)
  - [ ] provide errors to application for tracing or display
  - [ ] dynamic loading retry
- [ ] Translation splitting (nested Translation build method creates context)
- [ ] v3 - even more safety
- check translations for use of templating and parameters to avoid showing translations with broken templates
- make language code as parameter for formatters depend on language of the formatted translation,
so that translations that were replaced by default or fallback use the language of that default/fallback to match the formatting
- [ ] Data caching
- local storage
- how to check for changes?
  - invalidate after time
  - store time when cached and check if changes were made sinceand hooks
- [ ] Html Parser: switch Attributes to list, add attribute merging callback (list to object, default uses last value)
- [ ] Add more formatters & utilitys
- [ ] Custom lang resolve algorithm (Detector)

## Usage

- [Installations](#installation)
- [Providers](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/docs/Providers.md)
- [Direction & Document language](#direction--document-language)
- [Formatting/Templating Syntax](#formattingtemplating-syntax)
- [Rendering React Elements](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/docs/React-Renderer.md)

Most of the configuration and Boilerplate can be contained in a single file.

### Installation

```sh
npm install react-safe-i18n
pnpm add react-safe-i18n
```

### Providers

Based on your use case either the [Static](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/docs/Providers.md#static-provider) or [Async](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/docs/Providers.md#async-provider) Provider
should be sufficient enough to get you started.

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

See [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)'s documentation for it's syntax, [Here](https://github.com/ivanhofer/typesafe-i18n/tree/318c9042fddf179bde6775bbead9a37fc557ad2a/packages/runtime#syntax). Also the [development App of this project](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/app/src/pages/Formatters.tsx) and it's Formatters component for some examples on how to use the templating.

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

### Rendering React Elements

See [here](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main/docs/React-Renderer.md)

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
