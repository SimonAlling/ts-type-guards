# ts-type-guards
> Curried TypeScript type guards for primitive types and classes

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]

Simplifies typechecking by providing typeguards to check if something is of a certain type or of the same type as something else. Includes tailor-made typeguards for the primitive types and a general one for "classy" types.



## Installation

```sh
npm install ts-type-guards --save
```



## Usage examples

### Basic usage

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


### Checking against another value

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


### Primitive types

`is` can only handle classy types, so the primitive ones have their own typeguards:

```javascript
isUndefined(undefined); // true
isNumber("5"); // false
```

`isLike` supports the primitive types as well:

```javascript
isLike(5)(1.0); // true (because all numbers are floating point in JS)
isLike(null)(undefined); // false
```


### Reusing typeguards

Although it may seem clunky to have to write `is(x)(y)` instead of `is(x, y)`, this is a design choice based on the fact that partial application is so awesome. Not only does it get rid of `xs.filter(x => is(T, x))` in favor of `xs.filter(is(T))`, it also lets you save and reuse typeguards:

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
```



## Contributing

1. [Fork the repo](https://github.com/SimonAlling/ts-type-guards/fork).
1. Create your feature branch (`git checkout -b feature/foobar`).
1. Examine and add your changes (`git diff`, then `git add ...`).
1. Commit your changes (`git commit -m 'Add some foobar'`).
1. Push your feature branch (`git push origin feature/foobar`).
1. [Create a pull request](https://github.com/SimonAlling/ts-type-guards/pulls).



## License

[MIT](http://vjpr.mit-license.org)


[npm-image]: https://img.shields.io/npm/v/ts-type-guards.svg
[npm-url]: https://npmjs.org/package/ts-type-guards
[npm-downloads]: https://img.shields.io/npm/dm/ts-type-guards.svg
