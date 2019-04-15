import { primitive, Classy, TypeGuard, ArrayTypeGuard, ReadonlyArrayTypeGuard } from "./types";
import { isBoolean, isNumber, isString, isSymbol, isNull, isUndefined, isPrimitive, isNonPrimitive, is, isLike } from "./is";

export function isArrayOfBooleans(x: any): x is boolean[] {
    return isArrayOfLike(true)(x);
}

export function isArrayOfNumbers(x: any): x is number[] {
    return isArrayOfLike(1)(x);
}

export function isArrayOfStrings(x: any): x is string[] {
    return isArrayOfLike("")(x);
}

export function isArrayOfSymbols(x: any): x is symbol[] {
    return isArrayOfLike(Symbol())(x);
}

export function isArrayOfNulls(x: any): x is null[] {
    return isArrayOfLike(null)(x);
}

export function isArrayOfUndefineds(x: any): x is undefined[] {
    return isArrayOfLike(undefined)(x);
}

export function isArrayOfPrimitives(x: any): x is primitive[] {
    return is(Array)(x) && x.every(isPrimitive);
}

export function isArrayOfObjects(x: any): x is object[] {
    return is(Array)(x) && x.every(isNonPrimitive);
}

export function isArrayOf<T>(type: Classy<T>): (xs: any) => xs is T[] {
    return (xs: any): xs is T[] => is(Array)(xs) && xs.every(is(type));
}

export function isArrayOfLike<T>(reference: T): (x: any) => x is T[] {
    return (x: any): x is T[] => is(Array)(x) && x.every(isLike(reference));
}

export function isArrayOfAll<T>(guard: TypeGuard<T>): ArrayTypeGuard<T> {
    return (xs: any): xs is T[] => is(Array)(xs) && xs.every(guard);
}

export function isReadonlyArrayOfAll<T>(guard: TypeGuard<T>): ReadonlyArrayTypeGuard<T> {
    return isArrayOfAll(guard);
}
