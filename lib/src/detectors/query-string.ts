import { initQueryStringDetector } from 'typesafe-i18n/detectors';
import { LocaleHandler } from './types';

export function QueryStringDetector(
	key: string | undefined = 'lang'
): LocaleHandler {
	return {
		detector: initQueryStringDetector(key),
	};
}
