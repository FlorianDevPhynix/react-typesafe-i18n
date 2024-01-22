import { useLanguage } from './builder';
import React, { useEffect } from 'react';

export function LangHtmlComponent<C extends string>(props: {
	hook: useLanguage<C>;
}): React.JSX.Element {
	const { lang, direction } = props.hook();

	useEffect(() => {
		document.dir = direction;
	}, [direction]);

	useEffect(() => {
		document.documentElement.setAttribute('lang', lang);
	}, [lang]);

	return React.createElement(React.Fragment);
}

export type ExtendPromise<T> = {
	status: 'pending' | 'fulfilled' | 'rejected';
	value: T;
	reason: Error;
};

export function use<T>(inPromise: Promise<T>) {
	const promise = inPromise as Promise<T> & ExtendPromise<T>;
	if (promise.status === 'fulfilled') {
		return promise.value;
	} else if (promise.status === 'rejected') {
		throw promise.reason;
	} else if (promise.status === 'pending') {
		throw promise;
	} else {
		promise.status = 'pending';
		promise.then(
			(result) => {
				promise.status = 'fulfilled';
				promise.value = result;
			},
			(reason) => {
				promise.status = 'rejected';
				promise.reason = reason;
			}
		);
		throw promise;
	}
}
