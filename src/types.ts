export type primitive = boolean | number | string | symbol | null | undefined;

export type Classy<T> = Function & { prototype: T };

export type TypeGuard<T> = (x: any) => x is T;

export interface ArrayTypeGuard<T> {
    (xs: any[]): xs is T[];
    (xs: ReadonlyArray<any>): xs is ReadonlyArray<T>;
    (xs: any): xs is T[];
}

export interface ReadonlyArrayTypeGuard<T> {
    (xs: any): xs is ReadonlyArray<T>;
}
