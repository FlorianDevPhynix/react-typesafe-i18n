import * as React from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import { getLanguage } from './utility';

import {
	typesafeI18nObject,
	//BaseTranslation as objectBaseTranslation,
} from 'typesafe-i18n';

import type { BaseTranslation, Logger } from './types';
import type {
	Provider,
	LangListProvider,
	LanguageData,
	LangList,
	Direction,
	CacheEntry,
} from './providers';
import type { Detector } from './detectors';

export type i18nFuncType = {
	switchLang: (code: string) => void;
	getLang: () => string;
	resetLang: () => void;
};

class i18nBuilder<Base extends BaseTranslation, L extends LanguageData> {
	private detector: Detector | undefined = undefined;
	private provider: Provider;
	private langProvider: LangListProvider<L>;
	private logger: Logger = (...data) => console.error(data.join(' >> '));

	/** can be set with {@link i18nBuilder.addDefault} */
	private default: string | undefined;

	constructor(
		base: CacheEntry<Base, L>,
		provider: Provider & LangListProvider<L>
	);
	constructor(
		base: CacheEntry<Base, L>,
		provider: Provider,
		langProvider: LangListProvider<L>
	);
	constructor(
		/** base/fallback translation */
		private base: CacheEntry<Base, L>,
		provider: Provider & LangListProvider<L>,
		langProvider?: LangListProvider<L>
	) {
		this.provider = provider;
		if (langProvider === undefined) {
			this.langProvider = provider;
		} else {
			this.langProvider = langProvider;
		}
	}

	/**
	 * add a logger to collect all translation errors
	 * @param logger - a function similar to {@link console.error} (default)
	 */
	addLogger(logger: Logger) {
		this.logger = logger;
	}

	/**
	 * override the default language (default: base language code)
	 * @param lang - language code
	 */
	public addDefault(lang: string) {
		this.default = lang;
	}

	/**
	 * Detect the user's language with {@link LocaleDetector}s
	 * @param language_codes - codes of all the possibel languages
	 * @param detectors - The used locale detector(s).
	 */
	public addDetector(detector: Detector) {
		this.detector = detector;
	}

	// utilities
	private getLang() {
		if (this.detector === undefined) {
			return this.base.lang;
		}

		return this.detector.get(
			this.base.lang,
			this.langProvider,
			this.logger
		);
	}

	private setLang(code: string) {
		if (typeof this.detector === 'undefined') {
			return this.base.lang;
		}

		return this.detector.set(code, this.logger);
	}

	private async resolveLang(code: string) {
		return (await this.provider.get(code, this.logger))
			? code
			: this.base.lang;
	}

	private async genTranslation(code: string) {
		const result = await getLanguage<Base>(
			code,
			this.base,
			this.provider,
			this.logger
		);

		return {
			lang: result.lang,
			translation: typesafeI18nObject(result.lang, result.translation),
		};
	}

	// build
	async build(): Promise<{
		I18nProvider: (props: React.PropsWithChildren) => React.JSX.Element;
		useTranslation: () => ReturnType<
			typeof typesafeI18nObject<string, Base>
		>;
		useLanguage: () => {
			lang: string;
			direction: Direction;
			func: i18nFuncType;
		};
		languages: LangList<L>;
	}> {
		const langList = await this.langProvider.getLanguages(this.logger);

		// merge default into base
		if (this.default !== undefined) {
			const result = await getLanguage(
				this.default,
				this.base,
				this.provider,
				this.logger
			);
			this.base = {
				...result,
				langData:
					langList?.find((value) => value.code === result.lang) ??
					this.base.langData,
			};
		}

		const startLang = await (async () => {
			return this.genTranslation(await this.getLang());
		})();

		// contexts
		const translationContext = createContext(startLang.translation);
		const langContext = createContext(startLang.lang);
		//const languageListContext = createContext(startLang.translation);

		const lang_func_Context = createContext<i18nFuncType>({
			switchLang: () => {
				this.logger('No I18nProvider found');
			},
			getLang: () => {
				this.logger('No I18nProvider found');
				return this.base.lang;
			},
			resetLang: () => {
				this.logger('No I18nProvider found');
			},
		});

		/* const getLangCode = async () => {
			const code = this.getLang();
			await new Promise<void>((resolve) => setTimeout(resolve, 5 * 1000));
			if ((await this.provider.get(code)) === undefined) {
				return this.base.lang;
			}
			return code;
		};

		const getTranslation = async (lang: string) => {
			const result = await getLanguage<Base, D>(
				lang,
				this.base,
				this.provider
			);
			return typesafeI18nObject(result.lang, result.translation);
		};

		let usePromise:
			| Promise<
					[
						string,
						ReturnType<typeof typesafeI18nObject<string, Base>>,
					]
			  >
			| undefined;
		const getPromise = () => {
			console.log('getPromise');
			if (!usePromise) {
				usePromise = (async () => {
					const code = await getLangCode();
					const translation = await getTranslation(code);
					return [code, translation];
				})();
			}
			return usePromise;
		}; */

		// construct provider and helper hooks
		return {
			// provider
			I18nProvider: (props: React.PropsWithChildren) => {
				const [lang, setLang] = useState(startLang.lang);

				const [translated, setTranslation] = useState(
					() => startLang.translation
				);

				const i18nFunc: i18nFuncType = {
					switchLang: async (code: string) => {
						if (lang === code) return;
						const result = await this.genTranslation(code);
						setTranslation(() => result.translation);
						this.setLang(result.lang);
						setLang(result.lang);
					},
					getLang: () => lang,
					resetLang: () => i18nFunc.switchLang(this.base.lang),
				};

				return (
					<translationContext.Provider value={translated}>
						<langContext.Provider value={lang}>
							<lang_func_Context.Provider value={i18nFunc}>
								{props.children}
							</lang_func_Context.Provider>
						</langContext.Provider>
					</translationContext.Provider>
				);
			},

			useTranslation: function () {
				return useContext(translationContext);
			},
			useLanguage: (): {
				lang: string;
				direction: Direction;
				func: i18nFuncType;
			} => {
				const lang = useContext(langContext);

				return {
					lang,
					direction: useMemo(() => {
						if (langList === undefined) return 'LTR';

						return (
							langList.find((value) => value.code === lang)
								?.direction ?? 'LTR'
						);
					}, [lang]),
					func: useContext(lang_func_Context) as i18nFuncType,
				};
			},
			languages: langList ?? [
				{ code: this.base.lang, ...this.base.langData },
			],
		};
	}
}

export { i18nBuilder, i18nBuilder as default };
