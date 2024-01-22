import type { Language, Definition } from './index';

const translation: Definition<false> = {
  home: {},
  about: {
    title: 'Informazioni sulla pagina',
  },
};

export const lang = {
  code: 'it' as const,
  direction: 'ltr',
  langData: {
    name: 'Italiano',
    icon: undefined
  },
  translation,
} satisfies Language;
