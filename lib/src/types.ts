import type { DeepPartial } from 'utility-types';

/**
 * Deeply change all constant literal string types to just string.
 * Used to type translations for other languages.
 */
export type DeepStringify<Type> = {
	[Property in keyof Type]: Type[Property] extends string
		? string
		: Type[Property] extends object
		? DeepStringify<Type[Property]>
		: Type[Property];
};

/* export type ApplyDeep<Type> = {
  [Property in keyof Type]: Type[Property] extends Function
    ? Type[Property]
    : Type[Property] extends object
    ? ApplyDeep<ReturnType<typeof typesafeI18nObject<string, Type[Property]>>>
    : Type[Property];
}; */

export type BaseTranslation = {
	[key: string]:
		| string
		| BaseTranslation
		| BaseTranslation[]
		| Readonly<string>
		| Readonly<BaseTranslation>
		| Readonly<BaseTranslation[]>;
};

/**
 * Language object with it's translation
 */
export type Language<L, T> = { lang: L; translation: T };

/**
 * Language entry in the cache
 */
export type CacheEntry<D> = Language<string, D>;

export type Strict<T> = DeepStringify<T>;
export type NonStrict<T> = DeepPartial<Strict<T>>;

/**
 * S = boolean strict type T or not
 */
export type i18nDefinition<T, S extends boolean> = S extends true
	? Strict<T>
	: NonStrict<T>;
