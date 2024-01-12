import { type PluginOption } from 'vite';
import { Language } from './src/i18n/async/async';
type Translation = Record<string, unknown>;

export function LanguageServerPlugin(): PluginOption {
	const languages: Language[] = [
		{
			code: 'en',
			direction: 'ltr',
			langData: {
				name: 'English',
				icon: null,
			}
		},
		{
			code: 'de',
			direction: 'ltr',
			langData: {
				name: 'Deutsch',
				icon: null,
			}
		},
		{
			code: 'it',
			direction: 'ltr',
			langData: {
				name: 'Italiano',
				icon: null,
			}
		},
	];

	const translations = new Map<string, Translation>([
		[
			'en',
			{
				home: {
					count: 'count is: {count:number}!',
					tip: 'Edit src/App.tsx and save to test HMR',
					docs: 'Click on the Vite and React logos to learn more',
				},
				about: {
					title: 'About Page',
				},
				test: 'shared test value {count:number}',
			},
		],
		[
			'de',
			{
				home: {
					count: 'Die aktuelle Zählung ist: {count:number}!',
					tip: 'Bearbeiten Sie src/App.tsx und speichern Sie es, um HMR zu testen',
					docs: 'Klicken Sie auf die Vite- und React-Logos, um mehr zu erfahren',
				},
				about: {
					title: 'Über die Seite',
				},
				test: 'Test Wert',
			},
		],
		[
			'it',
			{
				home: {
					docs: 'Clicca sui loghi Vite e React per saperne di più',
				},
				about: {
					title: 'Informazioni sulla pagina',
				},
			},
		],
	]);

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
