import { initSessionStorageDetector } from 'typesafe-i18n/detectors';
import { LocaleHandler } from './types';

export function SessionStorageDetector(
	key: string | undefined = 'lang'
): LocaleHandler {
	return {
		detector: initSessionStorageDetector(key),
		setter: (lang) => {
			window.sessionStorage.setItem(key, lang);
		},
	};
}
