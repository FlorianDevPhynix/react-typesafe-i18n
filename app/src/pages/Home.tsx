import { startTransition, useState } from 'react';

/* import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg'; */

import { useTranslation } from '../i18n';

export const translation = {
	name: 'Home',
	title: 'Vite + React',
	count: 'count is: {count:number}!',
	docs: 'Static text',
	test: 'Example using formatters: "{test:string|lower|noSpaces}"',
} as const;

export default function Home() {
	const t = useTranslation();

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
			<h1>{t.home.title()}</h1>
			<div className="card">
				<button
					onClick={() =>
						startTransition(() => {
							setCount((count) => count + 1);
						})
					}
				>
					{t.home.count({ count })}
				</button>
			</div>
			<p className="read-the-docs">{t.home.docs()}</p>
			<p>{t.home.test({ test: 'TesT TEST 2' })}</p>
		</>
	);
}
