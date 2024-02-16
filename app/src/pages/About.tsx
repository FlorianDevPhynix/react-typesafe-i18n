import { useLanguage, useTranslation } from '../i18n';

export const translation = {
	name: 'About',
	title: 'About Page',
} as const;

export default function About() {
	const t = useTranslation();
	const { lang, func: f } = useLanguage();

	return (
		<>
			<h1>{t.about.title()}</h1>
			<div className="card">
				<p className="read-the-docs">{lang}</p>
				<button
					onClick={() => {
						f.switchLang('de');
					}}
				>
					Switch to German
				</button>
			</div>
		</>
	);
}
