import { Language, Definition } from './index';

const translation: Definition<false> = {
	home: {},
	about: {
		title: 'Informazioni sulla pagina',
	},
};

export const lang: Language = {
	lang: 'it',
	translation,
} as const;
