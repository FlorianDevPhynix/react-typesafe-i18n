import { useLanguage, useTranslation } from '../i18n';

export const translation = {
	title: 'About Page',
} as const;

export default function About() {
	const t = useTranslation();
	const [l, f] = useLanguage();

	return (
		<>
			<h1>{t.about.title()}</h1>
			<div className="card">
				<p className="read-the-docs">{l}</p>
				<button
					onClick={() => {
						f.switchLang('de');
					}}
				>
					German
				</button>
				<button
					onClick={() => {
						f.switchLang('it');
					}}
				>
					Italian
				</button>
				<button
					onClick={() => {
						f.resetLang();
					}}
				>
					Reset
				</button>
			</div>
		</>
	);
}
