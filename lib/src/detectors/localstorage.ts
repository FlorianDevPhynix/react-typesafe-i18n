import { initLocalStorageDetector } from 'typesafe-i18n/detectors';
import { LocaleHandler } from './types';

export function LocalStorageDetector(
	key: string | undefined = 'lang'
): LocaleHandler {
	return {
		detector: initLocalStorageDetector(key),
		setter: (lang) => {
			window.localStorage.setItem(key, lang);
		},
	};
}
