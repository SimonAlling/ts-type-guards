import { primitive, Classy } from "./types";
import { isBoolean, isNumber, isString, isSymbol, isNull, isUndefined, isPrimitive, isNonPrimitive, is, isLike } from "./is";

export function isArrayOfBooleans(x: unknown): x is boolean[] {
    return isArrayOfLike(true)(x);
}

export function isArrayOfNumbers(x: unknown): x is number[] {
    return isArrayOfLike(1)(x);
}

export function isArrayOfStrings(x: unknown): x is string[] {
    return isArrayOfLike("")(x);
}

export function isArrayOfSymbols(x: unknown): x is symbol[] {
    return isArrayOfLike(Symbol())(x);
}

export function isArrayOfNulls(x: unknown): x is null[] {
    return isArrayOfLike(null)(x);
}

export function isArrayOfUndefineds(x: unknown): x is undefined[] {
    return isArrayOfLike(undefined)(x);
}

export function isArrayOfPrimitives(x: unknown): x is primitive[] {
    return is(Array)(x) && x.every(isPrimitive);
}

export function isArrayOfObjects(x: unknown): x is object[] {
    return is(Array)(x) && x.every(isNonPrimitive);
}

export function isArrayOf<T>(type: Classy<T>): (xs: unknown) => xs is T[] {
    return (xs: unknown): xs is T[] => is(Array)(xs) && xs.every(is(type));
}

export function isArrayOfLike<T>(reference: T): (x: unknown) => x is T[] {
    return (x: unknown): x is T[] => is(Array)(x) && x.every(isLike(reference));
}
