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
 * Text Direction
 */
export type Direction = 'ltr' | 'rtl';

/**
 * base Language object
 */
export type BaseLanguage<C> = {
	code: C;
	direction: Direction;
};

/**
 * Language custom data type
 */
export type LanguageData = Record<string, unknown>;

/**
 * Language object with custom data
 */
export type Language<
	C extends string,
	D extends LanguageData,
> = BaseLanguage<C> & { langData: D };

/**
 * Translation for one language with custom data
 */
export type Translation<C extends string, D extends LanguageData, T> = Language<
	C,
	D
> & {
	translation: T;
};

/**
 * Utility type alias
 */
export type Strict<T> = DeepStringify<T>;
/**
 * Utility type alias
 */
export type NonStrict<T> = DeepPartial<Strict<T>>;

/**
 * S = boolean strict type T or not
 */
export type i18nDefinition<T, S extends boolean> = S extends true
	? Strict<T>
	: NonStrict<T>;

export type Logger = typeof console.error;
