import { useState } from 'react';

import { useTranslation } from '../i18n';

export const translation = {
	name: 'Nested',
	title: 'Nested Translations',
	count: 'count is: {count:number}!',
	test: 'Example using formatters: "{test:string|lower|noSpaces}"',
} as const;

export default function Home() {
	const t = useTranslation();

	const [count, setCount] = useState(0);

	return (
		<>
			<h1>{t.nested.title()}</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					{t.nested.count({ count })}
				</button>
			</div>
			<p>{t.nested.test({ test: 'TesT TEST 2' })}</p>
		</>
	);
}
