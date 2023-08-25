import { navigatorDetector } from 'typesafe-i18n/detectors';
import { LocaleHandler } from './types';

export function NavigatorDetector(): LocaleHandler {
	return {
		detector: navigatorDetector,
	};
}
