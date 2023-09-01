import { Provider } from './index';
import { LangListProvider, LangList, LanguageData } from './types';
import { BaseCacheEntry, Logger } from '../types';

export type Callback = (lang: string) => ReturnType<Provider['get']>;
export type LangCallback<L extends LanguageData> = () =>
	| Promise<LangList<L> | undefined>
	| LangList<L>
	| undefined;

/**
 * Cached by default
 */
export class AsyncProvider<L extends LanguageData>
	implements Provider, LangListProvider<L>
{
	private cache = new Map<string, object>();
	private langList: LangList<L> | undefined;

	constructor(
		private callback: Callback,
		private listCallback: LangCallback<L>
	) {}

	public async get(code: string, log: Logger) {
		const entry = this.cache.get(code);
		if (entry !== undefined) {
			return entry;
		}

		let result: ReturnType<Callback>;
		try {
			result = await this.callback(code);
		} catch (error) {
			log('AsyncProvider', `code = ${code}`, error);
			return null;
		}
		if (result !== undefined && result !== null) {
			this.cache.set(code, result);
			return result;
		}

		log(
			'AsyncProvider',
			`code = ${code}`,
			'callback did not return an object'
		);
		return undefined;
	}

	public set(lang: BaseCacheEntry<object>) {
		this.cache.set(lang.lang, lang.translation);
	}

	async getLanguages(log: Logger) {
		if (this.langList === undefined) {
			try {
				this.langList = await this.listCallback();
			} catch (error) {
				log('AsyncProvider', 'failed to get list of languages', error);
				return undefined;
			}
		}

		return this.langList;
	}
}

/**
 * make a object that provides the list of languages
 * @throws when callback failed, instead use {@link AsyncLangProvider}
 */
export async function asyncInitListProvider<L extends Record<string, unknown>>(
	callback: LangCallback<L>
): Promise<LangListProvider<L>> {
	const lang = await callback();
	return {
		getLanguages: () => lang,
	};
}

export function AsyncListProvider<L extends Record<string, unknown>>(
	callback: LangCallback<L>
): LangListProvider<L> & { langList: LangList<L> | undefined } {
	return {
		langList: undefined,
		getLanguages: async function (log) {
			if (this.langList === undefined) {
				try {
					this.langList = await callback();
				} catch (error) {
					log(
						'AsyncLangProvider',
						'failed to get list of languages',
						error
					);
					return undefined;
				}
			}

			return this.langList;
		},
	};
}
