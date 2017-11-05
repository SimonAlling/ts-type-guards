import { primitive, Classy, TypeGuard } from "./types";
import { isBoolean, isNumber, isString, isSymbol, isNull, isUndefined, isPrimitive, isNonPrimitive, is, isLike } from "./is";
import { isArrayOfBooleans, isArrayOfNumbers, isArrayOfStrings, isArrayOfSymbols, isArrayOfNulls, isArrayOfUndefineds, isArrayOfPrimitives, isArrayOfObjects, isArrayOf, isArrayOfLike } from "./is-array";
import { onlyBooleans, onlyNumbers, onlyStrings, onlySymbols, onlyNulls, onlyUndefineds, onlyPrimitives, onlyObjects, only, onlyLike } from "./only";

export {
    primitive,
    Classy,
    TypeGuard,

    isBoolean,
    isNumber,
    isString,
    isSymbol,
    isNull,
    isUndefined,
    isPrimitive,
    isNonPrimitive,
    is,
    isLike,

    isArrayOfBooleans,
    isArrayOfNumbers,
    isArrayOfStrings,
    isArrayOfSymbols,
    isArrayOfNulls,
    isArrayOfUndefineds,
    isArrayOfPrimitives,
    isArrayOfObjects,
    isArrayOf,
    isArrayOfLike,

    onlyBooleans,
    onlyNumbers,
    onlyStrings,
    onlySymbols,
    onlyNulls,
    onlyUndefineds,
    onlyPrimitives,
    onlyObjects,
    only,
    onlyLike,
};
