import {
    primitive,
    Classy,
    TypeGuard,
    UnionTypeGuard,
    FullyChainableTypeGuard,
    PrimitiveTypeGuard,
    NonPrimitiveTypeGuard,
    ChainableTypeGuard,
} from "./types";

const TYPE_GUARDS_PRIMITIVE = [isBoolean, isNumber, isString, isSymbol, isNull, isUndefined];

function intersect<A, B>(
    guardA: TypeGuard<A>,
    guardB: TypeGuard<B>,
): FullyChainableTypeGuard<A & B> {
    const guard: any = (value: any): value is A & B => guardA(value) && guardB(value);
    guard.chainable = true;
    guard.or = <C>(guardC: TypeGuard<C>) => unionize(guard, guardC, true);
    guard.and = <C>(guardC: TypeGuard<C>) => intersect(guard, guardC);
    return guard;
}

function unionize<A, B>(
    guardA: TypeGuard<A>,
    guardB: TypeGuard<B>,
    chainable: true,
): FullyChainableTypeGuard<A | B>;
function unionize<A, B>(
    guardA: TypeGuard<A>,
    guardB: TypeGuard<B>,
    chainable: false,
): UnionTypeGuard<A | B>;
function unionize<A, B>(
    guardA: TypeGuard<A>,
    guardB: TypeGuard<B>,
    chainable: boolean,
): FullyChainableTypeGuard<A | B> | UnionTypeGuard<A | B>;
function unionize<A, B>(
    guardA: TypeGuard<A>,
    guardB: TypeGuard<B>,
    chainable: boolean,
): UnionTypeGuard<A | B> | FullyChainableTypeGuard<A | B> {
    const guard: any = (value: any): value is A & B => guardA(value) || guardB(value);
    guard.chainable = chainable;
    guard.or = <C>(guardC: FullyChainableTypeGuard<C>) => unionize(guard, guardC, chainable);
    if (chainable) {
        guard.and = <C>(guardC: FullyChainableTypeGuard<C>) => intersect(guard, guardC);
    }
    return guard;
}

/**
 * Type guard for `boolean`.
 *
 * @param x
 */
export function isBoolean(x: unknown): x is boolean {
    return typeof x === "boolean";
}

/**
 * Type guard for booleans (primitive ones and objects).
 *
 * @param x
 */
export function isBooleanLike(x: unknown): x is boolean | Boolean {
    return isBoolean(x) || is(Boolean)(x);
}

/**
 * Type guard for `number`.
 *
 * @param x
 */
export function isNumber(x: unknown): x is number {
    return typeof x === "number";
}

/**
 * Type guard for numbers (primitive ones and objects).
 *
 * @param x
 */
export function isNumberLike(x: unknown): x is number | Number {
    return isNumber(x) || is(Number)(x);
}

/**
 * Type guard for `string`.
 *
 * @param x
 */
export function isString(x: unknown): x is string {
    return typeof x === "string";
}

/**
 * Type guard for strings (primitive ones and objects).
 *
 * @param x
 */
export function isStringLike(x: unknown): x is string | String {
    return isString(x) || is(String)(x);
}

/**
 * Type guard for `symbol`.
 *
 * @param x
 */
export function isSymbol(x: unknown): x is symbol {
    return typeof x === "symbol";
}

/**
 * Type guard for `null`.
 *
 * @param x
 */
export function isNull(x: unknown): x is null {
    return x === null;
}

/**
 * Type guard for `undefined`.
 *
 * @param x
 */
export function isUndefined(x: unknown): x is undefined {
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
export function isPrimitive(x: unknown): x is primitive {
    return TYPE_GUARDS_PRIMITIVE.some(f => f(x));
}

/**
 * Determines if something is not a primitive.
 *
 * @param x
 *
 * @return `true` iff `x` is not a primitive.
 */
export function isNonPrimitive(x: unknown): x is object {
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
export function is<T extends object>(reference: Classy<T>): NonPrimitiveTypeGuard<T>;
export function is<T extends primitive>(reference: T): PrimitiveTypeGuard<primitive>;
export function is<T>(type: primitive | Classy<T>): TypeGuard<T>;
export function is<T>(type: primitive | Classy<T>): TypeGuard<T> {
    if (isPrimitive(type)) {
        return (_: unknown): _ is T => false; // to resemble the semantics of instanceof
    }
    const guard = namedTypeGuard(is, type, (x: unknown): x is T => x instanceof type);
    (guard as any).chainable = true;
    return guard;
}

/**
 * Curried type guard for checking if something is like something else, i.e. of the same type or a subtype.
 *
 * @param reference An object to use as reference for the type guard.
 *
 * @return A type guard which returns `true` iff its argument is of the same type as `reference` or is an instance of that type.
 */
export function isLike<T extends object>(reference: T): NonPrimitiveTypeGuard<T>;
export function isLike<T extends primitive>(reference: T): PrimitiveTypeGuard<T>;
export function isLike<T>(reference: T): TypeGuard<T>;
export function isLike<T>(reference: T): TypeGuard<T> {
    for (const f of TYPE_GUARDS_PRIMITIVE) {
        if (f(reference)) {
            // This eta abstraction is necessary to please the typechecker, which otherwise complains that "type 'boolean' is not assignable to type 'T'" etc.
            return (x: unknown): x is T => f(x);
        }
    }
    let guard: any;
    if (is(Array)(reference)) {
        guard = (x: any): x is T => is(Array)(x) && (reference.length > 0 ? x.every(isLike(reference[0])) : true);
    } else if (reference.constructor === Object) {
        guard = (x: any): x is T => (
            isSomething(x)
            &&
            Object.keys(reference).every(k => isLike((reference as any)[k])(x[k]))
        );
    } else if (reference.constructor instanceof Function) {
        guard = is(reference.constructor);
    }
    if (guard) {
        guard.chainable = true;
        return guard;
    }
    throw new TypeError(isLike.name + ` cannot use this object as reference because it has no constructor: ` + JSON.stringify(reference));
}

/**
 * Curried type guard builder that is itself a type guard.
 *
 * `guard` by itself is a mere wrapper around a type guard. The difference is
 * that with a `guard` wrapper it's possible to chain type guards together,
 * either by union or intersection.
 *
 * `guard.or` creates a union of both type checks, e.g.
 * `guard(is(Animal)).or(isUndefined) => TypeGuard<Animal | undefined>`.
 *
 * `guard.and` creates an intersection of both type checks,
 * e.g. `guard(is(Animal)).and(is(Human)) => TypeGuard<Animal & Human>`.
 *
 * @param guard An object to use as reference for the type guard.
 *
 * @return A wrapped chainable type guard, that will perform exactly the
 * same check as its.
 */
export function guard<T extends object>(guard: NonPrimitiveTypeGuard<T>): FullyChainableTypeGuard<T>;
export function guard<T extends primitive>(guard: PrimitiveTypeGuard<T>): UnionTypeGuard<T>;
export function guard<T>(guard: TypeGuard<T>): ChainableTypeGuard<T>;
export function guard<T>(guard: TypeGuard<T>): ChainableTypeGuard<T> | UnionTypeGuard<T> | FullyChainableTypeGuard<T> {
    const chainable = isBoolean(guard.chainable) ? guard.chainable : false;
    const wrapperGuard: any = (value: any): value is T => guard(value);
    wrapperGuard.chainable = chainable;
    wrapperGuard.or = <T2>(guard2: TypeGuard<T2>) => unionize(wrapperGuard, guard2, chainable);
    if (chainable) {
        wrapperGuard.and = <T2>(guard2: TypeGuard<T2>) => intersect(wrapperGuard, guard2);
    }
    return wrapperGuard;
}


export const isNullLike = guard(isNull).or(isUndefined);
