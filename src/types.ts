export type primitive = boolean | number | string | symbol | null | undefined;

export type Classy<T> = Function & { prototype: T };

export type TypeGuard<T> = (x: any) => x is T;

/**
 * Enforces a value to be of a specific type by means of a type guard.
 */
export interface TypeEnforcer<T> {
    readonly name: string;
    <V extends T>(value: V): V;
    (value: any): never;

    orElse<F extends T>(value: F): TypeEnsurer<T, F>;

    orGet<F extends T>(getter: (() => F)): TypeEnsurer<T, F>;

    orMap<F extends T = T>(mapper: ((value: any) => T | F)): TypeEnsurer<T, F>;
}

/**
 * Ensures a value to be of a specific type by means of a type guard and a
 * fallback value.
 */
export interface TypeEnsurer<T, F extends T = T> {
    readonly name: string;
    <V extends T>(value: V): V;
    (value: any): F;
}
