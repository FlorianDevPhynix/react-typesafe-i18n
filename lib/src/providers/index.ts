import { CacheEntry } from '../types';
import { LanguageProvider } from '../detectors';

export interface Provider {
	get(code: string): Promise<object | undefined> | (object | undefined);

	//has(code: string): Promise<boolean> | boolean;

	set(lang: CacheEntry<object>): void;
}

export class StaticProvider implements Provider, LanguageProvider {
	private cache: Map<string, object>;

	constructor(languages: CacheEntry<object>[]) {
		this.cache = new Map<string, object>(
			languages.map((value) => [value.lang, value.translation])
		);
	}

	public get(code: string) {
		return this.cache.get(code);
	}

	public set(lang: CacheEntry<object>) {
		this.cache.set(lang.lang, lang.translation);
	}

	getLang(): string[] {
		return [...this.cache.keys()];
	}
}

export * from './async';
