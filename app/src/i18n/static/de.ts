import type { Language, Definition } from './index';

const translation: Definition<false> = {
  home: {
    count: 'Die aktuelle Zählung ist: {count:number}!',
    tip: 'Bearbeiten Sie src/App.tsx und speichern Sie es, um HMR zu testen',
    docs: 'Klicken Sie auf die Vite- und React-Logos, um mehr zu erfahren',
  },
  about: {
    title: 'Über die Seite',
  },
  //test: 'Test Wert',
};

export const lang = {
  code: 'de' as const,
  direction: 'ltr',
  langData: {
    name: 'Deutsch',
    icon: undefined
  },
  translation,
} satisfies Language;
