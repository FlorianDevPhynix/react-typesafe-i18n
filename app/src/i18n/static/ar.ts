import type { Language, Definition } from './index';

const translation: Definition<false> = {
	home: {
		name: 'وطن',
		title: 'فيت + رد فعل',
		count: 'العد هو: {count:number}!',
		docs: 'انقر على شعارات Vite و React لمعرفة المزيد',
		test: 'مثال على استخدام منسقات: "{test:string|lower|noSpaces}"',
	},
	about: {
		name: 'عن',
		title: 'حول الصفحة',
	},
	renderer: {
		name: 'العارض',
		title: 'العارض',
		simple: 'بسيط: حرر <code>{code:string}</code> وحفظ لاختبار HMR',
		complex: 'معقد: حرر <code>{code:string}</code> وحفظ لاختبار HMR',
		docs: 'يوضح هذان المثالان كيفية استخدام مكونات العارض البسيطة والمعقدة لتتمكن من تضمين Html/JSX في الترجمات',
	},
	nested: {
		name: 'متداخل',
		title: 'الترجمات المتداخلة',
		count: 'العد هو: {count:number}!',
		test: 'مثال على استخدام منسقات: "{test:string|lower|noSpaces}"',
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
