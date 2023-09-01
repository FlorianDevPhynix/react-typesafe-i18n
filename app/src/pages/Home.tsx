import { useState } from 'react';

import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';

import { useLanguage, useTranslation, languages } from '../i18n';

export const translation = {
	count: 'count is: {count:number}!',
	tip: 'Edit <code>src/App.tsx</code> and save to test HMR',
	docs: 'Click on the Vite and React logos to learn more',
} as const;

export default function Home() {
	const t = useTranslation();
	const { lang, direction, func: f } = useLanguage();

	const [count, setCount] = useState(0);

	return (
		<>
			{/* <div>
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
			</div> */}
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					{t.home.count({ count })}
				</button>
				<p>{t.home.tip()}</p>
			</div>
			<p className="read-the-docs">{t.home.docs()}</p>
			{lang} {direction}
			<div>
				{languages?.map((value) => (
					<button
						onClick={() => f.switchLang(value.code)}
						key={value.code}
					>
						{value.name}
					</button>
				))}
				<button onClick={() => f.resetLang()}>Reset</button>
			</div>
		</>
	);
}
