import { useState } from 'react';
import { useTranslation } from '../i18n';

export const translation = {
	title: 'Showcase',
	name: 'Formatters',
	date: 'Today is {0|weekday}',
	time: 'Next meeting: {0|timeShort}',
	plural: '{nr:number} {{apple|apples}}', // shorthand: apple{{s}}
	plural_2: '{{nr: no bananas | a banana | ?? bananas }}',
	plural_short: '{nr:number} weitere{{s|}} Mitglied{{er}}',
} as const;

// see for more information about the formatting
// https://github.com/ivanhofer/typesafe-i18n/tree/318c9042fddf179bde6775bbead9a37fc557ad2a/packages/runtime#syntax
export default function Formatters() {
	const [apples, setApples] = useState(0);
	const t = useTranslation();

	return (
		<>
			<h1>{t.formatters.title()}</h1>
			<div className="card">
				<p>{t.formatters.date(new Date(Date.now()))}</p>
				<p>{t.formatters.time(new Date(Date.now()))}</p>
				<input
					type="number"
					value={apples}
					onChange={(e) => setApples(Number(e.target.value))}
				></input>
				<p>{t.formatters.plural({ nr: apples })}</p>
				<p>{t.formatters.plural_2({ nr: apples })}</p>
				<p>{t.formatters.plural_short({ nr: apples })}</p>
			</div>
		</>
	);
}
