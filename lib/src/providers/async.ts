import { Provider } from './index';
import { LangListProvider, LangList, } from './types';
import { Translation, LanguageData, Logger } from '../types';

export type Callback<C extends string> = (lang: string) => ReturnType<Provider<C>['get']>;
export type LangCallback<C extends string, D extends LanguageData> = () =>
	| Promise<LangList<C, D> | undefined>
	| LangList<C, D>
	| undefined;

/**
 * Cached by default
 */
export class AsyncProvider<C extends string, D extends LanguageData>
	implements Provider<C>, LangListProvider<C, D>
{
	private cache = new Map<string, object>();
	private langList: LangList<C, D> | undefined;

	constructor(
		private callback: Callback<C>,
		private listCallback: LangCallback<C, D>
	) {}

	public async get(code: string, log: Logger) {
		const entry = this.cache.get(code);
		if (entry !== undefined) {
			return entry;
		}

		let result: ReturnType<Callback<C>>;
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

	public set(lang: Translation<C, D, object>) {
		this.cache.set(lang.code, lang.translation);
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
export async function asyncInitListProvider<C extends string, D extends LanguageData>(
	callback: LangCallback<C, D>
): Promise<LangListProvider<C, D>> {
	const lang = await callback();
	return {
		getLanguages: () => lang,
	};
}

export function AsyncListProvider<C extends string, D extends LanguageData>(
	callback: LangCallback<C, D>
): LangListProvider<C, D> & { langList: LangList<C, D> | undefined } {
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
