import { primitive, Classy, TypeGuard } from "./types";

const TYPE_GUARDS_PRIMITIVE = [isBoolean, isNumber, isString, isSymbol, isNull, isUndefined];

/**
 * Type guard for `boolean`.
 *
 * @param x
 */
export function isBoolean(x: any): x is boolean {
    return typeof x === "boolean";
}

/**
 * Type guard for `number`.
 *
 * @param x
 */
export function isNumber(x: any): x is number {
    return typeof x === "number";
}

/**
 * Type guard for `string`.
 *
 * @param x
 */
export function isString(x: any): x is string {
    return typeof x === "string";
}

/**
 * Type guard for `symbol`.
 *
 * @param x
 */
export function isSymbol(x: any): x is symbol {
    return typeof x === "symbol";
}

/**
 * Type guard for `null`.
 *
 * @param x
 */
export function isNull(x: any): x is null {
    return x === null;
}

/**
 * Type guard for `undefined`.
 *
 * @param x
 */
export function isUndefined(x: any): x is undefined {
    return x === undefined;
}

/**
 * Type guard for `null` or `undefined`.
 *
 * @param x
 */
export function isNothing<T>(x: T | undefined | null): x is null | undefined {
    return x === null || x === undefined;
}

/**
 * Type guard for everything except `null` and `undefined`.
 *
 * @param x
 */
export function isSomething<T>(x: T | undefined | null): x is T {
    return !isNothing(x);
}

/**
 * Determines if something is a primitive.
 *
 * @param x
 *
 * @return `true` iff `x` is a `boolean`, `number`, `string`, `symbol`, `null`, or `undefined`.
 */
export function isPrimitive(x: any): x is primitive {
    return TYPE_GUARDS_PRIMITIVE.some(f => f(x));
}

/**
 * Determines if something is not a primitive.
 *
 * @param x
 *
 * @return `true` iff `x` is not a primitive.
 */
export function isNonPrimitive(x: any): x is object {
    return !isPrimitive(x);
}

function namedFunction<F>(name: string, fun: F): F {
    return Object.defineProperty(fun, "name", { value: name, writable: false });
}

function namedTypeGuard<T>(creator: Function, type: Classy<T>, typeGuard: TypeGuard<T>): TypeGuard<T> {
    return namedFunction(`${creator.name}(${type.name})`, typeGuard);
}

/**
 * Curried type guard for non-primitive types.
 *
 * @param type The class to create a type guard for.
 *
 * @return A type guard which returns `true` iff its argument `x` satisfies `x instanceof type`.
 */
export function is<T>(type: Classy<T>): TypeGuard<T> {
    if (isPrimitive(type)) {
        return (_: any): _ is T => false; // to resemble the semantics of instanceof
    }
    return namedTypeGuard(is, type, (x: any): x is T => x instanceof type);
}

/**
 * Curried type guard for checking if something is like something else, i.e. of the same type or a subtype.
 *
 * @param reference An object to use as reference for the type guard.
 *
 * @return A type guard which returns `true` iff its argument is of the same type as `reference` or is an instance of that type.
 */
export function isLike<T>(reference: T): TypeGuard<T> {
    for (const f of TYPE_GUARDS_PRIMITIVE) {
        if (f(reference)) {
            // This eta abstraction is necessary to please the typechecker, which otherwise complains that "type 'boolean' is not assignable to type 'T'" etc.
            return (x: any): x is T => f(x);
        }
    }
    if (is(Array)(reference)) {
        const referenceAsArray = reference as any as Array<any>;
        return (x: any): x is T => is(Array)(x) && (referenceAsArray.length > 0 ? x.every(isLike(referenceAsArray[0])) : true);
    }
    if (reference.constructor === Object) {
        return (x: any): x is T => (
            ![ undefined, null ].includes(x)
            &&
            Object.keys(reference).every(k => isLike((reference as any)[k])(x[k]))
        );
    }
    if (reference.constructor instanceof Function) {
        return is<T>(reference.constructor);
    }
    throw new TypeError(isLike.name + ` cannot use this object as reference because it has no constructor: ` + JSON.stringify(reference));
}
