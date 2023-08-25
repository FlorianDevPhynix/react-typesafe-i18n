import { createContext, useContext, useState } from 'react';

import { getLanguage } from './utility';

import {
	typesafeI18nObject,
	BaseTranslation as objectBaseTranslation,
} from 'typesafe-i18n';

import type { BaseTranslation, CacheEntry, NonStrict } from './types';
import type { Provider } from './providers';
import type { Detector } from './detectors';

export type i18nFuncType = {
	switchLang: (code: string) => void;
	getLang: () => string;
	resetLang: () => void;
};

class i18nBuilder<Base extends BaseTranslation, D = NonStrict<Base>> {
	private detector: Detector | undefined = undefined;
	private default: string | undefined = undefined;

	constructor(
		private base: CacheEntry<Base>,
		private provider: Provider
	) {}

	/**
	 * Select a language as the default
	 * @param lang - language code
	 */
	add_default(lang: string) {
		this.default = lang;
	}

	/**
	 * Detect the user's language with {@link LocaleDetector}s
	 * @param language_codes codes of all the possibel languages
	 * @param detectors The used locale detector(s).
	 */
	add_detector(detector: Detector) {
		this.detector = detector;
	}

	// utilities
	private getLang() {
		if (this.detector === undefined) {
			if (this.default === undefined) {
				return this.base.lang;
			}

			return this.default;
		}

		return this.detector.get(this.base.lang);
	}

	// utilities
	private setLang(code: string) {
		if (typeof this.detector === 'undefined') {
			return this.base.lang;
		}

		return this.detector.set(code);
	}

	// build
	async build(): Promise<{
		I18nProvider: (props: React.PropsWithChildren) => React.JSX.Element;
		useTranslation: () => ReturnType<
			typeof typesafeI18nObject<string, Base>
		>;
		useLanguage: () => [string, i18nFuncType];
	}> {
		const defaultLang = await (async () => {
			const code = this.getLang();
			if ((await this.provider.get(code)) === undefined) {
				return this.base.lang;
			}
			return code;
		})();

		const result = await getLanguage<Base, D>(
			defaultLang,
			this.base,
			this.provider
		);

		const defaultTranslation = typesafeI18nObject(
			result.lang,
			result.translation
		);

		// contexts
		const translation_Context = createContext(defaultTranslation);
		const lang_Context = createContext(defaultLang);
		const lang_func_Context = createContext<i18nFuncType>({
			switchLang: function () {},
			getLang: () => this.base.lang,
			resetLang: () => {},
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
				const [lang, setLang] = useState(defaultLang);

				const [translated, setTranslation] = useState(
					() => defaultTranslation
				);

				const i18nFunc: i18nFuncType = {
					switchLang: async (code: string) => {
						if (lang === code) return;
						const result = await getLanguage<Base, D>(
							code,
							this.base,
							this.provider
						);
						this.setLang(result.lang);
						setTranslation(() =>
							typesafeI18nObject(result.lang, result.translation)
						);
						setLang(result.lang);
					},
					getLang: () => lang,
					resetLang: () => i18nFunc.switchLang(this.base.lang),
				};

				return (
					<translation_Context.Provider value={translated}>
						<lang_Context.Provider value={lang}>
							<lang_func_Context.Provider value={i18nFunc}>
								{props.children}
							</lang_func_Context.Provider>
						</lang_Context.Provider>
					</translation_Context.Provider>
				);
			},

			useTranslation: function () {
				return useContext(translation_Context);
			},
			useLanguage: function (): [string, i18nFuncType] {
				//const lang = useContext( langContext );

				return [
					useContext(lang_Context),
					useContext(lang_func_Context) as i18nFuncType,
				];
			},
		};
	}
}

export { i18nBuilder, i18nBuilder as default };
