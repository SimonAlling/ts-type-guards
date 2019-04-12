
import {
    TypeGuard,
    TypeEnforcer,
} from './types';

function makeEnforcerName<T>(guard: TypeGuard<T>) {
    return `ensure(${guard.name})`;
}

function makeEnsurerName<T, F = T>(guard: TypeGuard<T>, type: string, fallback: F) {
    const maxChars = 16;
    let fallbackName = '';
    if (fallback && typeof fallback === 'function') {
        fallbackName = (fallback as any).name;
    } else if (typeof fallback === 'string') {
        fallbackName = `"${fallback.length <= maxChars ? fallback : fallback.slice(0, maxChars)}"`;
    } else {
        fallbackName = String(fallback);
        if (fallbackName.length > maxChars) {
            fallbackName = fallbackName.slice(0, 16);
        }
    }
    return `${makeEnforcerName(guard)}.${type}(${fallbackName || '?'})`;
}

function assignName<T>(value: T, name: string) {
    Object.defineProperty(value, 'name', {
        value: name,
        writable: false,
        configurable: true,
        enumerable: true,
    });
}

/**
 * Creates a type enforcer.
 * 
 * Use `orElse`, `orGet` and `orMap` to create a type ensurer (i.e. that returns
 * a fallback value instead of throwing TypeError when the value does not
 * conform) instead.
 * 
 * @param guard The type guard to use
 * @param message An optional error message. Not actually used when a fallback
 * value is provided.
 */
export function ensure<T>(
    guard: TypeGuard<T>,
    message?: string | (() => string),
): TypeEnforcer<T> {
    const invalidFallbackMessage = 
        "The fallback value provided is invalid or does not meet the enforcer's type requirements.";
    const getErrorMessage = () => 
        typeof message === 'string' ? message
        : message ? message()
        : "The value provided is invalid or does not meet the enforcer's type requirements.";
    function doEnforce<V extends T>(value: V): V;
    function doEnforce(value: any): never;
    function doEnforce<V extends T>(value: V): V {
        if (guard(value)) return value;
        throw new TypeError(getErrorMessage());
    }
    assignName(doEnforce, makeEnforcerName(guard));
    const enforcer = Object.assign(doEnforce, {
        orElse<F extends T>(fallback: F) {
            if (!guard(fallback)) throw new TypeError(invalidFallbackMessage);
            const ensurer = <V>(value: V): V | F => {
                if (guard(value)) return value;
                return fallback;
            };
            assignName(doEnforce, makeEnsurerName(guard, 'orElse', fallback));
            return ensurer;
        },
        orGet<F extends T>(fallbackGetter: (() => F)) {
            if (typeof fallbackGetter !== 'function') throw new TypeError("Invalid fallback getter");
            const ensurer = <V>(value: V): V | F => {
                if (guard(value)) return value;
                const fallback = fallbackGetter();
                if (!guard(fallback)) throw new TypeError(invalidFallbackMessage);
                return fallback;
            };
            assignName(doEnforce, makeEnsurerName(guard, 'orElse', fallbackGetter));
            return ensurer;
        },
        orMap<F extends T>(fallbackMapper: ((value: any) => F)) {
            if (typeof fallbackMapper !== 'function') throw new TypeError("Invalid fallback mapper");
            const ensurer = <V>(value: V): V | F => {
                if (guard(value)) return value;
                const fallback = fallbackMapper(value);
                if (!guard(fallback)) throw new TypeError(invalidFallbackMessage);
                return fallback;
            };
            assignName(doEnforce, makeEnsurerName(guard, 'orElse', fallbackMapper));
            return ensurer;
        },
    });
    return enforcer;
}