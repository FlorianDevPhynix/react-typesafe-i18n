import {
	type BaseFormatters,
	uppercase,
	lowercase,
	replace,
} from 'react-safe-i18n/formatters';
import { Codes } from './index';

export function initFormatters(locale: Codes) {
	return {
		noSpaces: replace(/\s/g, '-'),
		upper: uppercase,
		lower: lowercase,
	} satisfies BaseFormatters;
}
