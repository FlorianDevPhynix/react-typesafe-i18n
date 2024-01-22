import {
	type BaseFormatters,
	uppercase,
	lowercase,
	replace,
} from 'react-safe-i18n/formatters';

export function initFormatters(locale: string) {
	return {
		noSpaces: replace(/\s/g, '-'),
		upper: uppercase,
		lower: lowercase,
	} satisfies BaseFormatters;
}
