import { initDocumentCookieDetector } from 'typesafe-i18n/detectors';
import { LocaleHandler } from './types';

export function DocumentCookieDetector(
	key: string | undefined = 'lang'
): LocaleHandler {
	return {
		detector: initDocumentCookieDetector(key),
		setter: (lang) => {
			document.cookie = document.cookie
				.split(';')
				.map((part) => {
					const value = part.trim();
					return value.startsWith(key) ? `${key}=${lang}` : value;
				})
				.join(';');
		},
	};
}
