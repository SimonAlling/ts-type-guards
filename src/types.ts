export type primitive = boolean | number | string | symbol | null | undefined;

export type Classy<T> = Function & { prototype: T };

export interface TypeGuard<T> {
    (x: any): x is T;
    readonly chainable?: boolean;
}

export interface PrimitiveTypeGuard<T extends primitive> extends TypeGuard<T>{
    readonly chainable?: false;
}

export interface NonPrimitiveTypeGuard<T extends object> extends TypeGuard<T> {
    readonly chainable: true;
}

export interface UnionTypeGuard<T> extends TypeGuard<T> {
    readonly chainable?: false;
    or<T2>(guard: TypeGuard<T2>): UnionTypeGuard<T | T2>;
}

export interface ChainableTypeGuard<T> extends TypeGuard<T> {
    or<T2>(guard: TypeGuard<T2>): ChainableTypeGuard<T | T2>;
    and?<T2>(guard: TypeGuard<T2>): ChainableTypeGuard<T & T2>;
}

export interface FullyChainableTypeGuard<T> extends TypeGuard<T> {
    readonly chainable: true;
    or<T2>(guard: TypeGuard<T2>): FullyChainableTypeGuard<T | T2>;
    and<T2>(guard: TypeGuard<T2>): FullyChainableTypeGuard<T & T2>;
}
