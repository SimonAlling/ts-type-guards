import {
    isBoolean,
    isBooleanLike,
    isNumber,
    isNumberLike,
    isString,
    isStringLike,
    isSymbol,
    isNull,
    isUndefined,
    isNothing,
    isSomething,
    isPrimitive,
    isNonPrimitive,
    is,
    isLike,
} from "../src/index";

const SATISFY = true;
const NOT_SATISFY = false;

const SOUNDNESS = false;
const COMPLETENESS = true;

function to(shouldSatisfy: boolean) {
    return <T>(received: T, predicate: (x: T) => boolean) => {
        const satisfied = predicate(received);
        const predicateAsString = (predicate as { name?: string }).name || predicate.toString();
        return {
            message: () => `expected ${JSON.stringify(received)} ${satisfied ? "not " : ""}to satisfy ${predicateAsString}`,
            pass: shouldSatisfy === satisfied,
        };
    };
}

interface Expect extends jest.Matchers<void> {
    toSatisfy: (x: any) => boolean
    toNotSatisfy: (x: any) => boolean
    extend: (extensions: { [ k: string ]: any }) => void
    (x: any): Expect
}

declare const expect: Expect

expect.extend({
    toSatisfy: to(SATISFY),
    toNotSatisfy: to(NOT_SATISFY),
});

function checkPredicate(shouldSatisfy: boolean) {
    return (predicate: (x: any) => boolean, xs: ReadonlyArray<any>): void => {
        xs.forEach(x => {
            (shouldSatisfy ? expect(x).toSatisfy : expect(x).toNotSatisfy)(predicate);
        });
    };
}

function check(predicate: (x: any) => boolean, values: {
    shouldSatisfy: ReadonlyArray<any>,
    shouldNotSatisfy: ReadonlyArray<any>,
}): void {
    checkPredicate(SOUNDNESS)(predicate, values.shouldNotSatisfy);
    checkPredicate(COMPLETENESS)(predicate, values.shouldSatisfy);
}

it("isUndefined", () => {
    check(isUndefined, {
        shouldSatisfy: [ undefined ],
        shouldNotSatisfy: [ null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
});

it("isNull", () => {
    check(isNull, {
        shouldSatisfy: [ null ],
        shouldNotSatisfy: [ undefined, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
});

it("isNothing", () => {
    check(isNothing, {
        shouldSatisfy: [ null, undefined ],
        shouldNotSatisfy: [ true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
});

it("isSomething", () => {
    check(isSomething, {
        shouldSatisfy: [ true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
        shouldNotSatisfy: [ null, undefined ],
    });
    class Cat { name: string }
    class Dog { name: string }
    function accessName(x: Cat | Dog | null | undefined) {
        if (isSomething(x)) {
            x.name; // should compile
        }
    }
});

it("isBoolean", () => {
    check(isBoolean, {
        shouldSatisfy: [ true, false ],
        shouldNotSatisfy: [ undefined, null, 0, 1, "", "foo", Symbol(), _ => 5, [], {}, new Boolean(true) ],
    });
});

it("isBooleanLike", () => {
    check(isBooleanLike, {
        shouldSatisfy: [ true, false, new Boolean(true), new Boolean(false) ],
        shouldNotSatisfy: [ undefined, null, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
});

it("isNumber", () => {
    check(isNumber, {
        shouldSatisfy: [ 0, 1, -1, Math.PI, NaN, Infinity, -Infinity ],
        shouldNotSatisfy: [ undefined, null, true, false, "", "foo", Symbol(), _ => 5, [], {}, new Number(1) ],
    });
});

it("isNumberLike", () => {
    check(isNumberLike, {
        shouldSatisfy: [ 0, 1, -1, Math.PI, NaN, Infinity, -Infinity, new Number(1) ],
        shouldNotSatisfy: [ undefined, null, true, false, "", "foo", Symbol(), _ => 5, [], {} ],
    });
});

it("isString", () => {
    check(isString, {
        shouldSatisfy: [ "", "foo" ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, Symbol(), _ => 5, [], {}, new String("foo") ],
    });
});

it("isStringLike", () => {
    check(isStringLike, {
        shouldSatisfy: [ "", "foo", new String("foo") ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, Symbol(), _ => 5, [], {} ],
    });
});

it("isSymbol", () => {
    check(isSymbol, {
        shouldSatisfy: [ Symbol() ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", _ => 5, [], {} ],
    });
});

it("isPrimitive", () => {
    check(isPrimitive, {
        shouldSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol() ],
        shouldNotSatisfy: [ _ => 5, [], {}, new Boolean(true), new Number(1), new String("foo") ],
    });
});

it("isNonPrimitive", () => {
    check(isNonPrimitive, {
        shouldSatisfy: [ _ => 5, [], {}, new Boolean(true), new Number(1), new String("foo") ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol() ],
    });
});

class Animal { constructor(public readonly name: string) {} }
class Lion extends Animal {}
class Warthog extends Animal {}
const someone = new Animal("Someone");
const simba = new Lion("Simba");
const nala = new Lion("Nala");
const pumbaa = new Warthog("Pumbaa");

it("is", () => {
    check(is(undefined), {
        shouldSatisfy: [],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
    check(is(null), {
        shouldSatisfy: [],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
    check(is(Animal), {
        shouldSatisfy: [ simba, nala, pumbaa, someone ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
    check(is(Lion), {
        shouldSatisfy: [ simba, nala ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {}, pumbaa, someone ],
    });
    check(is(Warthog), {
        shouldSatisfy: [ pumbaa ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {}, simba, nala, someone ],
    });
});

it("isLike for basic types and class instances", () => {
    check(isLike(undefined), {
        shouldSatisfy: [ undefined ],
        shouldNotSatisfy: [ null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
    check(isLike(null), {
        shouldSatisfy: [ null ],
        shouldNotSatisfy: [ undefined, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
    check(isLike(true), {
        shouldSatisfy: [ true, false ],
        shouldNotSatisfy: [ undefined, null, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
    check(isLike(false), {
        shouldSatisfy: [ true, false ],
        shouldNotSatisfy: [ undefined, null, 0, 1, "", "foo", Symbol(), _ => 5, [], {} ],
    });
    check(isLike(5), {
        shouldSatisfy: [ 0, 1, -1, Math.PI, NaN, Infinity, -Infinity ],
        shouldNotSatisfy: [ undefined, null, true, false, "", "foo", Symbol(), _ => 5, [], {} ],
    });
    check(isLike("foo"), {
        shouldSatisfy: [ "", "bar" ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, Symbol(), _ => 5, [], {} ],
    });
    check(isLike(someone), {
        shouldSatisfy: [ simba, nala, pumbaa, someone ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {}, Animal, Lion, Warthog ],
    });
    check(isLike(simba), {
        shouldSatisfy: [ simba, nala ],
        shouldNotSatisfy: [ undefined, null, true, false, 0, 1, "", "foo", Symbol(), _ => 5, [], {}, Animal, Lion, Warthog, pumbaa, someone ],
    });
});

const BASICS: ReadonlyArray<any> = [ undefined, null, true, false, 0, 1, "", "foo", Symbol(), _ => 5 ];

it("isLike for dictionaries", () => {
    check(isLike({ a: "aaa" }), {
        shouldSatisfy: [ { a: "aaa" }, { a: "aaa", b: 5 } ],
        shouldNotSatisfy: BASICS.concat([ [], {}, { b: "bbb" }, { a: 5 }, { a: undefined } ]),
    });
    check(isLike({ a: "aaa", b: "bbb" }), {
        shouldSatisfy: [ { a: "aaa", b: "bbb" }, { a: "aaa", b: "bbb", c: 5 } ],
        shouldNotSatisfy: BASICS.concat([ [], {}, { c: "ccc" }, { a: "aaa" }, { a: 5, b: "bbb" }, { a: undefined, b: undefined } ]),
    });
});

it("isLike for arrays", () => {
    check(isLike([ undefined ]), {
        shouldSatisfy: [ [], [ undefined ], [ undefined, undefined, undefined ] ],
        shouldNotSatisfy: BASICS.concat([ {}, { b: "bbb" }, { a: 5 }, { a: undefined }, [ null ], [ undefined, null ] ]),
    });
    check(isLike([ null ]), {
        shouldSatisfy: [ [], [ null ], [ null, null, null ] ],
        shouldNotSatisfy: BASICS.concat([ {}, { b: "bbb" }, { a: 5 }, { a: null }, [ undefined ], [ null, undefined ] ]),
    });
    check(isLike([ true, false ]), {
        shouldSatisfy: [ [], [ true ], [ false ], [ true, true, true, false ] ],
        shouldNotSatisfy: BASICS.concat([ {}, { b: "bbb" }, { a: 5 }, { a: undefined }, [ 0 ], [ true, 0 ] ]),
    });
    check(isLike([ 0, 1, 2 ]), {
        shouldSatisfy: [ [], [ 0 ], [ NaN ], [ 0, 1, NaN, Infinity, -Infinity ] ],
        shouldNotSatisfy: BASICS.concat([ {}, { b: "bbb" }, { a: 5 }, { a: undefined }, [ true ], [ 0, true ] ]),
    });
    check(isLike([ "foo", "bar" ]), {
        shouldSatisfy: [ [], [ "" ], [ "foo" ], [ "foo", "bar" ] ],
        shouldNotSatisfy: BASICS.concat([ {}, { b: "bbb" }, { a: 5 }, { a: undefined }, [ true ], [ "foo", true ] ]),
    });
    check(isLike([ Symbol(), Symbol() ]), {
        shouldSatisfy: [ [], [ Symbol() ], [ Symbol(), Symbol() ] ],
        shouldNotSatisfy: BASICS.concat([ {}, { b: "bbb" }, { a: 5 }, { a: undefined }, [ true ], [ Symbol(), true ] ]),
    });
});

it("isLike for array of dictionaries", () => {
    check(isLike([ { a: "aaa" } ]), {
        shouldSatisfy: [ [], [ { a: "a" } ], [ { a: "a" }, { a: "aa" } ] ],
        shouldNotSatisfy: BASICS.concat([ {}, [ {} ], [ { b: "bbb" } ], [ { a: 5 } ], [ { a: undefined } ] ]),
    });
});
