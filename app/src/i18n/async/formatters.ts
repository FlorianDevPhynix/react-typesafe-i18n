import {
	type BaseFormatters,
	uppercase,
	lowercase,
	replace,
	date,
	time,
} from 'react-safe-i18n/formatters';

export function initFormatters(locale: string) {
	return {
		noSpaces: replace(/\s/g, '-'),
		upper: uppercase,
		lower: lowercase,
		weekday: date(locale, { weekday: 'long' }),
		timeShort: time(locale, { timeStyle: 'short' }),
	} satisfies BaseFormatters;
}
