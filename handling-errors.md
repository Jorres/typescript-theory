## Ways to handle an error

### Returning null

```typescript
let generateDate = (): Date | null => {
    let rawString = prompt("what is your birthday");
    if (validDate(rawString)) {
        return new Date(rawString);
    }
    return null;
};

// But then you'll have to check it after every possible operation that returns null:

let date = generateDate();
if (date) {

} else {

}
```

Thus, combining several calculations, each of them returning null as an error, can be extremely verbose
and moreover, we lose information about why an error happened in the first place.


### Throwing exceptions

```typescript
let generateDate = (): Date | null => {
    let rawString = prompt("what is your birthday");
    if (validDate(rawString)) {
        return new Date(rawString);
    }
    throw RangeError("wrong date format!");
};

try {
    let date = generateDate();
} catch (e) {
    if (e instanceof RangeError) {
        // custom handling
    } else {
        throw e;
    }
}
```

This way is a bit more successful since:
- we can put multiple calculations inside a single try-catch and handle errors in one place,
being very granular where we want to handle every type of error
- we manage to propagate some information about an error to the place where it got handled.

But still, exception is no part of signature in TS (as opposing to Java), and a person can just
forget try-catch block for your calculation, thus crashing the application in runtime.

### Returning exceptions

We can emulate Java behaviour by adding exceptions to return type of the function:

```typescript
let generateDate = (): Date | RangeError => {
    let rawString = prompt("what is your birthday");
    if (validDate(rawString)) {
        return new Date(rawString);
    }
    return new RangeError("wrong date format!");
};

let date = generateDate();
if (date instanceof RangeError) {

} else {

}
```

The whole question aside about checked exceptions being good or evil, we successfully forced user to handle
every possible return path of our execution.

### HASKELL WAY YADA YADA YADA (just kidding)

You can have a type that emulates haskell monad behaviour. 
Let's write the minimal implementation of maybe:

```typesctipt
interface Option<T> {
    compose<U>: (f: (T) => Option<U>) => Option<U>; // looks like `>>=`
    getOrElse(val: T) => T; // unwrap, haskell achieved this with pattern matching
}

class Option<T> { // and this is `return`
    constructor(arg: T) {
        if (!arg) {
            return None;
        }
        return new Some(arg);
    }
}

class Some<T> implements Option<T> {
    private val: T;

    constructor(arg: T) {
        this.val = arg;
    }

    compose(f) {
        return f(this.val);
    }

    getOrElse(_) {
        return this.val;
    }
}

class None implements Option<never> = {
    compose<U>(f: (T) => Option<U>): Option<never> {
        return this;
    }

    getOrElse(alt) {
        return alt;
    }
}
```

The obvious downside of this approach is that it does not interoperate with code that does not use options, and 
sometimes you'll have to wrap your values into `Option` type for nothing, and you still get quite minimal information
on what had gone wrong (that is, of course, mitigated by `Either` type). In general it is quite an impressive way
of chaining calculations in a linear fashion.
