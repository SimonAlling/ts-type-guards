# ts-type-guards
> Curried TypeScript type guards for primitive types and classes

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]

Simplifies typechecking by providing type guards to check if something is of a certain type or of the same type as something else. Includes tailor-made type guards for the primitive types and a general one for "classy" types.



## Installation

```sh
npm install ts-type-guards --save
```



## Usage Examples

### Basic Usage

```javascript
import { is } from "ts-type-guards";

const header = document.querySelector("header");
console.log(header.textContent); // Error: Object is possibly 'null'.
if (is(HTMLElement)(header)) {
    console.log(header.textContent); // Compiles and runs safely.
}
```

Because `is`, `only` etc are curried, you can use them like so:

```javascript
import { is } from "ts-type-guards";

const foos = Array.from(document.querySelectorAll(".foo"));
const fooImages = foos.filter(is(HTMLImageElement));
const srcs = fooImages.map(img => img.src); // Compiles and runs safely.
```

Equivalent:

```javascript
import { only } from "ts-type-guards";

const foos = Array.from(document.querySelectorAll(".foo"));
const fooImages = only(HTMLImageElement)(foos);
const srcs = fooImages.map(img => img.src); // Compiles and runs safely.
```

Additionally, `onlyIf` can also be used to filter non-classy values, if needed.

```typescript
import { onlyIf } from "ts-type-guards";

type IdOrRef = string | { id: string };

function toReferences(idsOrReferences: IdOrRef[]) {
    const onlyIds = onlyIf(isString)(idsOrReferences);
    const idsAsReferences = onlyIds.map(id => { id });
    const onlyReferences = onlyIf(isNonPrimitive)(idsOrReferences);
    return [
        ...idsAsReferences,
        ...onlyReferences,
    ];
}
```

### Checking Against Another Value

Use `isLike` to check if something is of the same type as a reference value:

```javascript
import { isLike } from "ts-type-guards";

// We want to make sure that this function always returns a T:
function getFromLocalStorage<T>(key: string, fallback: T): T {
    const saved: string | null = localStorage.getItem(key);
    if (isNull(saved)) {
        return fallback;
    }
    const parsed: any = JSON.parse(saved);
    return (
        isLike(fallback)(parsed)
        ? parsed // parsed is like fallback, so it is a T!
        : fallback // parsed has wrong type, so return fallback.
    );
}

getFromLocalStorage("volume", 50); // Guaranteed to be a number.
```

(Note that this function can still throw `DOMException` or `SyntaxError`, but that's not a typechecking problem.)


### Subclasses

`is` is basically a partially applicable `instanceof`. For classy types, `isLike(ref)(x)` is equivalent to `x instanceof ref.constructor`.

```javascript
class Animal {}
class Lion extends Animal {}
class Warthog extends Animal {}

const someone = new Animal();
const simba = new Lion();
const nala = new Lion();
const pumbaa = new Warthog();

is(Animal)(simba);  // true
is(Lion)(simba);    // true
is(Warthog)(simba); // false
is(Lion)(someone);  // false

isLike(someone)(simba); // true
isLike(nala)(simba);    // true
isLike(pumbaa)(simba);  // false
isLike(nala)(someone);  // false
```


### Primitive Types

`is` can only handle classy types, so the primitive ones have their own type guards:

```javascript
isUndefined(undefined); // true
isNumber("5"); // false
```

`isLike` supports the primitive types as well:

```javascript
isLike(5)(1.0); // true (because all numbers are floating point in JS)
isLike(null)(undefined); // false
```


### Reusing Type Guards

Although it may seem clunky to have to write `is(x)(y)` instead of `is(x, y)`, this is a design choice based on the fact that partial application is so awesome. Not only does it get rid of `xs.filter(x => is(T, x))` in favor of `xs.filter(is(T))`, it also lets you save and reuse type guards:

```javascript
const isFoo = is(LongModuleName.Foo);

if (isFoo(x)) {
    x.baz();
}

xs.filter(isFoo).forEach(x => x.baz());
```


### Arrays

You can check if something is an array of a certain type:

```javascript
isArrayOfNumbers([1, 2, 3]); // true
isArrayOfNumbers([1, 2, "3"]); // false
isArrayOf(Error)([
    new RangeError(),
    new TypeError(),
]); // true
isArrayOfAll(isString)([ "simba", "nala" ]); // false
isArrayOfAll(isString)([ "simba", new Lion("nala") ]); // false
isArrayOfSome(isString)([ "simba", new Lion("nala") ]); // true
```

All of the examples above are roughly equivalent to:

```javascript
function isArrayOfX(guard) {
    if (is(Array)(xs)) {
        return xs.every(guard); // or xs.some(guard) in the case of isArrayOfSome
    }
}
```


#### Arrays and Readonly-ness

`isArrayOfAll` and `isArrayOfSome` are typed so that they return a curried type guard that preserves the readonly-ness of an eventual readonly array input, if any.

In other words: if the input value is statically known to be a readonly array, the return type of the curried type guard is `xs is ReadonlyArray<T>`; otherwise, the return type is `xs is T[]`.

If you want to force the curried type guard to have an exclusively readonly array type check (i.e. always `xs is ReadonlyArray<T>`), use `isReadonlyArrayOfAll` and `isReadonlyArrayOfSome` instead. Note, however, that the input value is still checked **only** for `is(Array)`; neither [freezing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) nor [sealing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) checks are performed.

```typescript
declare const animals: any;
declare const readonlyAnimals: ReadonlyArray<any>;

const isAnimal = is(Animal);

if (isArrayOfAll(isAnimal)(animals)) {
    // animals is Animal[]
}

if (isArrayOfAll(isAnimal)(readonlyAnimals)) {
    // readonlyAnimals is ReadOnlyArray<Animal>
}

if (isReadonlyArrayOfAll(isAnimal)(animals)) {
    // animals is ReadOnlyArray<Animal>
}
```


## Contributing

1. [Fork the repo](https://github.com/SimonAlling/ts-type-guards/fork).
2. Create your feature branch (`git checkout -b feature/foobar`).
3. Examine and add your changes (`git diff`, then `git add ...`).
4. Commit your changes (`git commit -m 'Add some foobar'`).
5. Push your feature branch (`git push origin feature/foobar`).
6. [Create a pull request](https://github.com/SimonAlling/ts-type-guards/pulls).



## License

[MIT](http://vjpr.mit-license.org)


[npm-image]: https://img.shields.io/npm/v/ts-type-guards.svg
[npm-url]: https://npmjs.org/package/ts-type-guards
[npm-downloads]: https://img.shields.io/npm/dm/ts-type-guards.svg
