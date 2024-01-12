import * as React from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import { getLanguage } from './utility';

import {
	typesafeI18nObject,
	//BaseTranslation as objectBaseTranslation,
} from 'typesafe-i18n';

import type { BaseTranslation, Translation, LanguageData, Direction, Logger } from './types';
import type {
	Provider,
	LangListProvider,
	LangList
} from './providers';
import type { Detector } from './detectors';

export type i18nFuncType<C extends string> = {
	switchLang: (code: C) => void;
	getLang: () => C;
	resetLang: () => void;
};

class i18nBuilder<C extends string, D extends LanguageData, Base extends BaseTranslation> {
	private detector: Detector<C, D> | undefined = undefined;
	private provider: Provider<C>;
	private langProvider: LangListProvider<C, D>;
	private logger: Logger = (...data) => console.error(data.join(' >> '));

	/** can be set with {@link i18nBuilder.addDefault} */
	private default: C | undefined;

	constructor(
		base: Translation<C, D, Base>,
		provider: Provider<C> & LangListProvider<C, D>
	);
	constructor(
		base: Translation<C, D, Base>,
		provider: Provider<C>,
		langProvider: LangListProvider<C, D>
	);
	constructor(
		/** base/fallback translation */
		private base: Translation<C, D, Base>,
		provider: Provider<C> & LangListProvider<C, D>,
		langProvider?: LangListProvider<C, D>
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
	public addDefault(lang: C) {
		this.default = lang;
	}

	/**
	 * Detect the user's language with {@link LocaleDetector}s
	 * @param language_codes - codes of all the possibel languages
	 * @param detectors - The used locale detector(s).
	 */
	public addDetector(detector: Detector<C, D>) {
		this.detector = detector;
	}

	// utilities
	private getLang() {
		if (this.detector === undefined) {
			return this.base.code;
		}

		return this.detector.get(
			this.base.code,
			this.langProvider,
			this.logger
		);
	}

	private setLang(code: C) {
		if (typeof this.detector === 'undefined') {
			return this.base.code;
		}

		return this.detector.set(code, this.logger);
	}

	private async resolveLang(code: C) {
		return (await this.provider.get(code, this.logger))
			? code
			: this.base.code;
	}

	private async genTranslation(code: C) {
		const result = await getLanguage<C, D, Base>(
			code,
			this.base,
			this.provider,
			this.logger
		);

		return {
			lang: result.code,
			translation: typesafeI18nObject(result.code, result.translation),
		};
	}

	// build
	async build(): Promise<{
		I18nProvider: (props: React.PropsWithChildren) => React.JSX.Element;
		useTranslation: () => ReturnType<
			typeof typesafeI18nObject<string, Base>
		>;
		useLanguage: () => {
			lang: C;
			direction: Direction;
			func: i18nFuncType<C>;
		};
		languages: LangList<C, D>;
	}> {
		const langList = await this.langProvider.getLanguages(this.logger);

		// merge default into base
		if (this.default !== undefined) {
			const result = await getLanguage<C, D, Base>(
				this.default,
				this.base,
				this.provider,
				this.logger
			);
			const lang = langList?.find((value) => value.code === result.code) ?? this.base;
			this.base = {
				...result,
				direction: lang.direction,
				langData: lang.langData,
			};
		}

		const startLang = await (async () => {
			return this.genTranslation(await this.getLang());
		})();

		// contexts
		const translationContext = createContext(startLang.translation);
		const langContext = createContext(startLang.lang);
		//const languageListContext = createContext(startLang.translation);

		const lang_func_Context = createContext<i18nFuncType<C>>({
			switchLang: () => {
				this.logger('No I18nProvider found');
			},
			getLang: () => {
				this.logger('No I18nProvider found');
				return this.base.code;
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

				const i18nFunc: i18nFuncType<C> = {
					switchLang: async (code: C) => {
						if (lang === code) return;
						const result = await this.genTranslation(code);
						setTranslation(() => result.translation);
						this.setLang(result.lang);
						setLang(result.lang);
					},
					getLang: () => lang,
					resetLang: () => i18nFunc.switchLang(this.base.code),
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
				lang: C;
				direction: Direction;
				func: i18nFuncType<C>;
			} => {
				const lang = useContext(langContext);

				return {
					lang,
					direction: useMemo(() => {
						if (langList === undefined) return 'ltr';

						return (
							langList.find((value) => value.code === lang)
								?.direction ?? 'ltr'
						);
					}, [lang]),
					func: useContext(lang_func_Context) as i18nFuncType<C>,
				};
			},
			languages: langList ?? [
				{ code: this.base.code, direction: this.base.direction, langData: this.base.langData },
			],
		};
	}
}

export { i18nBuilder, i18nBuilder as default };
