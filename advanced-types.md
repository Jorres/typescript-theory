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

