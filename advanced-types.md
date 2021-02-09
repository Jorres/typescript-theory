### Subtype
Type `B` is a subtype of type `A` if can be used anywhere where `A` required.
Everything is a subtype of any, because everything implements enough to be any.
Never is a subtype of nothing, because never implements nothing.
Array is a subtype of an object... and so on.

### Supertype
Type `B` is a supertype of type `A` if `A` can be used anywhere where `B` required.
The opposite of how subtypes work


### Design decisions about covariance and contravariance in TS
Covariance - when you expect a `T` and are happy with any subtype of `T`. 
Typescript lets this fly when statically checking types anywhere except functions.
Contravariance - when you expect a `T` and are happy with any supertype of `T`.

With functions: in order for function `F` to be more precise (subtype) than G:
1) `F` return type must be subtype of `G` return type, i.e. larger, i.e. `F` return type has more information
2) but `F` should accept arguments at most as precise as `G`'s arguments, i.e. NOT BIGGER than `G`'s arguments.
Thus we say, functions are contravariant in argument types and covariant in return types.

[The same, but with more pictures and analogies](https://medium.com/@michalskoczylas/covariance-contravariance-and-a-little-bit-of-typescript-2e61f41f6f68)

### Type widening

Typescript always tries to infer the widest type possible (because it is intuitively correct, you don't want 
`a` being `5` in 

```
let a = 5;
```

Type widening happens by default when you assign `null` to something, it is inferred as any. It is also intuitive,
because null can be a null instead of pretty much anything.

You can stop type widening from happening by typing it by hand:
```typescript
let x: {property: '3'} = {property: '3'};
```
Without manual typing, type would be inferred as `{property: string}`.
You can do the same thing with `let x = {expression} as const`, see more for type assertions.

### Symbolic execution

Typescript has a design decision that remarkably few other languages have. A symbolic execution engine. It is 
the program that would run your code as the runtime would, but without assigning specific values to variables.
It uses control-flow constructs like `typeof`, `instanceof`, `in`, `?`, `|` and `&` on types.
It is just watching over type constraints changing as the program runs, detecting unreachable code, saying 'this function
never returns' and things like that. 
Java and C++ achieve the same by requiring excessive typing. 
Haskell achieves the similar purpose by using pattern-matching, although it is rather unintuitive. 
Out of other famous languages I know, only Kotlin possesses it.

Example:
```typescript
let f = (arg: number | undefined): number => {
    if (arg == null) {
        return 0;
    }
    // at this point, TS knows the type is not 'number|undefined' anymore,
    // it is just 'number', because the previous 'if' statement worked well,
    // and thus the next line is perfectly typesafe:
    return arg + 10;
}
```

### Keying-in over types:
This is the way to get the definition for type B as part of the definition of type A.

```typescript
type APIResponse = {
    user: {
        userId: string
        friendList: {
            count: number
            friends: {
            firstName: string
               lastName: string
            }[]
        }
    }
}

type FriendList = APIResponse['user']['friendList']
```

### Keying-of 
`keyof A` type operator gets all the keys from the type `A` and joins them in a string union.
```typescript
keyof {a: number, b: number}` = 'a' | 'b'
```

### Why key-ing and key-ofing?
Let's play some muscles:
Because you can build a powerful typesafe object field getter using this technique. Watch and learn:
```typescript
let get = <O extends object,  // getter accepts any object
           K extends keyof O> // and ANY FIELD NAME (statically known), key-of part
           (o: O, k: K): 
           O[K] // and returns type that corresponds to the type of the field, key-in part
           => {
    return o[k];
};
```
Now you have to think of a reason to use this in your project, but this is typesafe!
Of course this is garbage when you can do just `myObject.key1.key2` and still get inferred type. The reason
is not that obvious I'd say. But it's cool how typechecker is able to parse the program code to extract raw text
(type signatures) and return them as a result of some operator. Probably we are yet to find usage somewhere.

### Totality

Imagine the following piece of code:
```
let f = (arg: 'a' | 'b'): string => {
    if (arg == 'a') {
        return 'somestring';
    }
}
```
Typescript will complain that return type is not `string | undefined`. Because he checked and not all the execution
paths return string value. However, if you add a second `if` to check whether `arg` is `b` and will not add any return 
outside of two `if` statements, TS will figure out that the argument is totally covered and no other execution
paths are possible. This is the concept of totality.

### Mapped types

Feature of TS that is syntactically similar to index signature, but index signature allows all the strings
and numbers to be a key of an object, but mapped type limits to a certain subset of strings or numbers that
are present in other type.

```typescript
type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
type Day = WeekDay | 'Sat' | 'Sun';

let nextDayFor: {[K in WeekDay] : Day} = {
    Mon: 'Tue'
};
// Error TS2739: Type '{Mon: "Tue"}' is missing the following properties
// from type '{Mon: Weekday; Tue: Weekday; Wed: Weekday; Thu: Weekday;
// Fri: Weekday}': Tue, Wed, Thu, Fri.
```

Mapped type syntax allows you to put additional constraints on keys or values that came from other type. 
Consider:
```typescript
type Account = {
    id: number,
    name: string
};

// constraint on keys:
type ReadOnlyAccount = {
    readonly [K in keyof Account]: Account[K] // note `key of` syntax!!
};

// constraint on values (rather an extension, not a constraint)
type NullableAccount = {
    [K in keyof Account]: Account[K] | null
};
```

These modifiers are so useful that TS defines a set of special types for us:
```typescript
Record<Keys, Values>
// An object with keys of type Keys and values of type Values
Partial<Object>
// Marks every field in Object as optional
Required<Object>
// Marks every field in Object as nonoptional
Readonly<Object>
// Marks every field in Object as read-only
Pick<Object, Keys>
// Returns a subtype of Object, with just the given Keys
```

### Companion object pattern

Types and values live in different namespaces in Typescript. It is perfectly valid to have a type and an object
with the same name:


```typescript
type Currency = { 
    type: 'RUB' | 'USD', 
    amount: number,
    toUSD: (arg: 'RUB', amount: number) => Currency
};

const Currency: Currency = {
    type: 'RUB',
    amount: 100,
    toUSD: (arg, amount) => {type: 'USD', amount: arg * 75, toUSD: toUSD};
};
```

This allows the programmer to ease his mind about making redundant amount of names and it also allows users to 
import both entities - an object and a type - at the same time!

### User-defined type guards

Automatic type refinement only works in single scope.
Consider:

```typescript
let isString = (arg: string): boolean => {
    return typeof arg === 'string'
}

let otherF = (arg: string | number) => {
    if (isString(arg)) {
        return arg.length; // length does not exist on type `number`!
    }
}
```

Power of type refinement is finite and it is generally not possible to derive something from other scope, 
even though this example looks pretty simple.

You can have your special defined 'user type guards' for this purpose: 

```typescript
let isString = (arg: string): arg is string => {
    ... // note that this is not important what you write here.
    // typechecker will believe you because you specified
    // your typecheck in type signature. If you fail to check
    // for type properly here, you lose safety.
}
```

### Conditional types

Might be single most unique Typescript feature. Similar to metaprogramming in C++.
Lets you do the following:

```typescript
type IsString<T> = T extends string ? true : false;
```
What does it allow to do that we couldn't do without it?

Have a look at the particular effect:

```typescript
type ToArray2<T> = T extends unknown ? T[] : T[]
type A = ToArray2<number> // number[]
type B = ToArray2<number | string> // number[] | string[]
```
You've just propagated the array type to different branches instead of having type 
`(string | number)[]`, this is called the distributive law for conditional types.

Muscle play:
```typescript
type Without<T, U> = T extends U ? never : T;

type Result = Without<'a'|'b'|'c', 'a'|'c'|'d'>;
// Result == 'b'
```

#### `infer` keyword
Let's imagine we have to make a conditional type that would extract type of elem in an array, 
and if input is not the array then type of the input remains.
```typescript
type ElementType<T> = T extends unknown[] ? ... : T;
// what to write instead of ...?
```
It is not achievable with just generics:
```typescript
type ElementType<T, U> = T extends U[] ? U : T; // so far so good

type MyElemType = ElementType<number[], number>; // and now we have defeated the whole purpose.
// we already know the type if we supply it as second generic.
```
`infer` keyword to the rescue:
```typescript
type ElementType<T> = T extends (infer U)[] ? U : T;
type MyElemType = ElementType<number[]>; // yay! number
```
Now silly example aside, again some muscle play:
```typescript
let SecondArg<F> => F extends (a: any, b: infer B) => any ? B : never;
let F = typeof Array['prototype']['slice'];
let secondSliceArg = SecondArg<F> // number | undefined
```
We know marvellous things at compile time :)

### Type assertions

Sometimes you just want to test out something without proving to Typescript what you're doing is correct.
This is obviously an escape hatch and you should do this as few times as possible:

```typescript
type T1 = string | number;
type T2 = number;

const t1: T1 = 10;

const t2: T2 = t1; // will fail even though it would be correct at runtime
const t2: T2 = (t1 as T2); // this is what you can do.
```
Similarly, you can say `({value} as any)` and then use this in your codebase, but this is REALLY unsafe so 
you'd better stand in the corner for a few minutes and think about what you're doing.

### Non-null assertions
Sometimes you have to tell that the value of type 'string | undefined' is really a string at this point 
because you know for sure, you have some complex invariant in your program. In this case, you can do this:

```typescript
type V = {data: string | undefined | null};
const V = {data: null};
const element = V!.data; // and this will compile because you told TS to.
// although this is an obvious mistake at such a simple example.

// If you tried:
const element = V.data; // you would get an error.
```
If you have to use a lot of type assertions in your code you're probably doing something wrong.

