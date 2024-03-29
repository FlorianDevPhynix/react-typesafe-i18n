import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';

import './App.css';

import Home from './pages/Home';
import About from './pages/About';
import Renderer from './pages/Renderer';
import Formatters from './pages/Formatters';
import Nested from './pages/Nested';
import { useTranslation, languages, useLanguage } from './i18n';

export default function App() {
	const t = useTranslation();
	const { lang, func: f, direction } = useLanguage();
	const [page, setPage] = useState(0);

	const language = useMemo(() => {
		return languages.find((value) => value.code == lang);
	}, [lang]);

	return (
		<>
			<button onClick={() => setPage(0)}>{t.home.name()}</button>
			<button onClick={() => setPage(1)}>{t.about.name()}</button>
			<button onClick={() => setPage(2)}>{t.renderer.name()}</button>
			<button onClick={() => setPage(3)}>{t.formatters.name()}</button>
			<button onClick={() => setPage(4)}>{t.nested.name()}</button>
			{page === 0 && <Home />}
			{page === 1 && <About />}
			{page === 2 && <Renderer />}
			{page === 3 && <Formatters />}
			{page === 4 && <Nested />}
			{lang} {direction}
			<br />
			<label htmlFor="language">
				<FontAwesomeIcon icon={faLanguage} />
			</label>
			<select
				id="language"
				dir={direction}
				onChange={(e) => f.switchLang(e.target.value)}
				value={language?.code}
			>
				{languages.map((value) => (
					<option
						value={value.code}
						lang={value.code}
						key={value.code}
					>
						{value.langData.name}
					</option>
				))}
			</select>
			<div>
				{languages.map((value) => (
					<button
						onClick={() => f.switchLang(value.code)}
						key={value.code}
						lang={value.code}
					>
						{value.langData.name}
					</button>
				))}
				<button onClick={() => f.resetLang()}>Reset</button>
			</div>
		</>
	);
}
