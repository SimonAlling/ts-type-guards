import { primitive, Classy } from "./types";
import { isBoolean, isNumber, isString, isSymbol, isNull, isUndefined, isPrimitive, isNonPrimitive, is, isLike } from "./is";

export function onlyBooleans(xs: any[]): boolean[] {
    return xs.filter(isBoolean);
}

export function onlyNumbers(xs: any[]): number[] {
    return xs.filter(isNumber);
}

export function onlyStrings(xs: any[]): string[] {
    return xs.filter(isString);
}

export function onlySymbols(xs: any[]): symbol[] {
    return xs.filter(isSymbol);
}

export function onlyNulls(xs: any[]): null[] {
    return xs.filter(isNull);
}

export function onlyUndefineds(xs: any[]): undefined[] {
    return xs.filter(isUndefined);
}

export function onlyPrimitives(xs: any[]): primitive[] {
    return xs.filter(isPrimitive);
}

export function onlyObjects(xs: any[]): object[] {
    return xs.filter(isNonPrimitive);
}

export function only<T>(type: Classy<T>): (xs: any[]) => T[] {
    return (xs: any[]): T[] => xs.filter(is(type));
}

export function onlyLike<T>(reference: T): (xs: any[]) => T[] {
	return (xs: any[]): T[] => xs.filter(isLike(reference));
}
