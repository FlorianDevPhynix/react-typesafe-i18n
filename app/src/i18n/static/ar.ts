import type { Language, Definition } from './index';

const translation: Definition<false> = {
	home: {
		name: 'وطن',
		title: 'فيت + رد فعل',
		count: 'العد هو: {count:number}!',
		tip: 'حرر <code>src/App.tsx</code> وحفظ لاختبار HMR',
		docs: 'انقر على شعارات Vite و React لمعرفة المزيد',
		test: 'مثال على استخدام منسقات: "{test:string|lower|noSpaces}"',
	},
	about: {
		name: 'عن',
		title: 'حول الصفحة',
	},
};

export const lang = {
	code: 'ar' as const,
	direction: 'rtl',
	langData: {
		name: 'العربية',
		icon: undefined,
	},
	translation,
} satisfies Language;
