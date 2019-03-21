import { primitive, Classy } from "./types";
import { isBoolean, isNumber, isString, isSymbol, isNull, isUndefined, isPrimitive, isNonPrimitive, is, isLike } from "./is";

export function onlyBooleans(xs: unknown[]): boolean[] {
    return xs.filter(isBoolean);
}

export function onlyNumbers(xs: unknown[]): number[] {
    return xs.filter(isNumber);
}

export function onlyStrings(xs: unknown[]): string[] {
    return xs.filter(isString);
}

export function onlySymbols(xs: unknown[]): symbol[] {
    return xs.filter(isSymbol);
}

export function onlyNulls(xs: unknown[]): null[] {
    return xs.filter(isNull);
}

export function onlyUndefineds(xs: unknown[]): undefined[] {
    return xs.filter(isUndefined);
}

export function onlyPrimitives(xs: unknown[]): primitive[] {
    return xs.filter(isPrimitive);
}

export function onlyObjects(xs: unknown[]): object[] {
    return xs.filter(isNonPrimitive);
}

export function only<T>(type: Classy<T>): (xs: unknown[]) => T[] {
    return (xs: unknown[]): T[] => xs.filter(is(type));
}

export function onlyLike<T>(reference: T): (xs: unknown[]) => T[] {
    return (xs: unknown[]): T[] => xs.filter(isLike(reference));
}
