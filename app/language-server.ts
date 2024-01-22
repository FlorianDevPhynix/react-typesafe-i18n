import { type PluginOption } from 'vite';

import { base_language } from './src/i18n/static';
import { lang as german } from './src/i18n/static/de';
import { lang as italian } from './src/i18n/static/it';
import { lang as arabic } from './src/i18n/static/ar';

type Translation = Record<string, unknown>;

export function LanguageServerPlugin(): PluginOption {
	function make_translation<C extends string, D extends object>({
		code,
		translation,
	}: {
		code: C;
		translation: D;
	}): [C, D] {
		return [code, translation];
	}

	const translations = new Map<string, Translation>([
		make_translation(base_language),
		make_translation(german),
		make_translation(italian),
		make_translation(arabic),
	]);

	const languages = [base_language, german, italian, arabic].map((value) => ({
		code: value.code,
		direction: value.direction,
		langData: value.langData,
	}));

	return {
		name: 'language-server-plugin',
		apply: 'serve',

		configureServer(server) {
			server.middlewares.use('/rest/i18n/languages', (req, res, next) => {
				if (req.method !== 'GET') {
					next();
					return;
				}

				// respond with language list
				res.end(JSON.stringify(languages));
			});

			server.middlewares.use(
				'/rest/i18n/translations/',
				(req, res, next) => {
					if (req.method !== 'GET') {
						next();
						return;
					}

					// prep url
					let url: string = req.url;
					if (url.startsWith('/')) {
						url = url.substring(1, url.length);
					}
					if (url.endsWith('/')) {
						url = url.substring(0, url.length - 1);
					}

					// get language code from url
					const parts = url.split('/');
					//console.log(parts);
					parts[parts.length - 1];

					// respond with translation
					res.end(
						JSON.stringify(
							translations.get(parts[parts.length - 1])
						)
					);
				}
			);
		},
	};
}
