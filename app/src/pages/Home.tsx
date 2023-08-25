import { useState } from 'react';

import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';

import { useLanguage, useTranslation } from '../i18n';

export const translation = {
	count: 'count is: ',
	tip: 'Edit <code>src/App.tsx</code> and save to test HMR',
	docs: 'Click on the Vite and React logos to learn more',
} as const;

export default function Home() {
	const t = useTranslation();
	const [l, f] = useLanguage();

	const [count, setCount] = useState(0);

	t.test();
	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img
						src={reactLogo}
						className="logo react"
						alt="React logo"
					/>
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					{t.home.count()} {count}
				</button>
				<p>{t.home.tip()}</p>
			</div>
			<p className="read-the-docs">{t.home.docs()}</p>
			{l}
			<br></br>
			<button onClick={() => f.switchLang('de')}>German</button>
			<button onClick={() => f.switchLang('it')}>Italian</button>
			<button onClick={() => f.resetLang()}>Reset</button>
		</>
	);
}
