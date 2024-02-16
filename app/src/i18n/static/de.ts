import type { Language, Definition } from './index';

const translation: Definition<false> = {
	home: {
		count: 'Die aktuelle Zählung ist: {count:number}!',
		tip: 'Bearbeiten Sie <code "id":"test">{code:string}</code> und speichern Sie es, um HMR zu testen. <button "onClick":"Dies ist Sicher!">Klicken</button>',
		docs: 'Statischer Text',
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
		icon: undefined,
	},
	translation,
} satisfies Language;
