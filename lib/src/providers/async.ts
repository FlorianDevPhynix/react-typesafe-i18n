import { Provider } from './index';
import { CacheEntry } from '../types';
import { LanguageProvider } from '../detectors';

export type Callback = (lang: string) => ReturnType<Provider['get']>;

/**
 * Cached by default
 */
export class AsyncProvider implements Provider {
	private cache = new Map<string, object>();

	constructor(private callback: Callback) {}

	public async get(code: string) {
		const entry = this.cache.get(code);
		if (typeof entry !== 'undefined') {
			return entry;
		}

		const result = await this.callback(code);
		if (typeof result !== 'undefined') {
			return result;
		}

		return undefined;
	}

	public set(lang: CacheEntry<object>) {
		this.cache.set(lang.lang, lang.translation);
	}
}

export async function initAsyncLangProvider(
	callback: () => Promise<string[]> | string[]
): Promise<LanguageProvider> {
	const lang = await callback();
	return {
		getLang: () => lang,
	};
}
