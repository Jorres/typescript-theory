function a(arg: number) {
    return arg;
}

a(2); // typechecks
// does not typecheck: a('z'); 

// any
function a2(arg: any) {
    return arg;
}

a2(2);
a2({arg: 'arg'}); // both typecheck

// unknown
function a3(arg: unknown) {
    // does not typecheck: let t = arg + 10;
    if (typeof arg === 'number') {
        return arg + 10;            
    }
    return arg;
}

a3(10);
a3({arg: 'arg'}); // both typecheck! But you can't do anything illegal with unknown.
// TS never infers anything as unknown.

const typeLiteral = true // try to hover on me to check my type!
// the type of `typeLiteral` is a type literal. The most narrow type is inferred.
// Even look at this:
const doubleTypeLiteral : 26.128 = 26.128;
// let doubleTypeLiteral : 123.123 = 26.128; // Won't compile with a funny message!


// Object typing is best inferred:
let objExplicitlyStated : {b: number} = {
    b: 2
};

let objInferred = {
    b: 'abc'
};

// Type alias: (with an index signature):
type airplaneSeats = {[seatNumber: string]: string};
// Type aliases are block-scoped, just as let and const variables.

// Index signature, a way to tell the compiler to expect multiple properties of this type
let emptySeats : airplaneSeats = {};
let oneSeat    : airplaneSeats = {'24A': 'Egor Tarasov'};
let twoSeats   : {[seatNumber: number]: string} = {24: 'Egor Tarasov', 28: 'Ania Tselikova'};
// in {[key : T] : U}, T must be assignable to either `number` or `string`


// Optional `?`: 
type optionalExample = {a: string, b?: number};
let objWithoutOptional : optionalExample = {a: '123'};
// fields marked optional might be undefined:
let objWithOptional : optionalExample = {a: '123', b: undefined};
// but not null:
// let objWithOptional : optionalExample = {a: '123', b: null}
// and might be with OK value:
let objWithOptionalCorrect : optionalExample = {a: '123', b: 42};

// readonly - like const, after first assignment can't be replaced
type TreadonlyExample = {readonly a : number};
let readonlyExample : TreadonlyExample = {a: 123};
// readonlyExample.a = 42; -- won't compile as it is readonly



// Union and intersection:
type Cat = {animal: true, purrs: boolean};
type Dog = {animal: true, barks: boolean, anotherDogFunction: boolean};

type TCatoDog = Cat | Dog;
// Will satisfy IF AND ONLY IF every field of at least one type is present
let catodog1 : TCatoDog = {animal: true, barks: false, anotherDogFunction: false};
let catodog2 : TCatoDog = {animal: true, purrs: false};
// let catodog3 : TCatoDog = {animal: true, anotherDogFunction: false}; // wont compile!

type TCataDog = Cat & Dog;
// Will satisfy IF AND ONLY IF every field of every type is present
let catadog : TCataDog = {animal: true, purrs: true, barks: false, anotherDogFunction: true};

// Arrays:
// `Array<number>` is identical to `number[]`, in meaning and in performance.
let arr1 = [1, 2]; // number[]
let arr2 = [1, '2']; // (number|string)[]
let arr3 = []; // any[]

// Tuples: warning, not as in haskell :) [number] and number[] are separate things.
let tupleExample: [number, string] = [1, '2'];
// Notice - they must be explicitly typed. Because otherwise TS compiler will infer this as
// a `(string | number)[]` and you can do nothing about it. JS has no () for tuples, live with this.

// Now just to keep your brain busy, for a bit more complex example:
let trainFares : ([number] | [number, number])[] = 
    [
        [1],
        [1, 2]
    ];

// Tuples can have optionals, and this is equivalent to the example above:
let trainFaresWithOptional : [number, number?][] = 
    [
        [1],
        [1, 2]
    ];

// Good practice: go with as much immutability as you can. 
// For example, this is an immutable array:
let immutableArray : readonly number[] = [1, 2, 3];
// immutableArray[2] = 3.14; // won't compile!
// But really, if you will really think about immutable arrays, condider some third-party implementation.


// Other other-wordly types:
let nullValue: null = null;
let undefinedValue: undefined = undefined;
// let undefinedValue: undefined = null; // won't compile! 
// `null` and `undefined` types are populated with `null` and `undefined` values respectively.

// Void is a type of a function that returns nothing at all. Reeeally specific.
// From implementation: if a function has no `return` keyword in it, it is safely `void`
// But might be never! The narrower the type, the better!
function returnNothing(arg: any): void {
    console.log(arg); 

    // if (false) {   // This piece of code won't compile even if it is never reached
    //     return 2;  // We specifically told this function to not have `return`s. 
    // }
}

returnNothing(2);
// let returnNothingResult: number = returnNothing(2);
// ^^^ obviously won't compile.


// Never - a bottom type. The type of a function that never returns:
// either by throwing an exception or by running indefinitely. Thus, never is assignable
// to ANYTHING - just because the code will never get executed.
// Never is actually a type that has no values.

// function endless(arg: Int): never {
//  // a function returning `never` cannot have reachable end-point.
// }
//
function endless(): never {
    while(true) {

    }
}

let tryAssigningNever: string = endless(); // and this compiles! 
// This comes from type theory, of course, where `_|_ -> a` is True no matter what `a` is.
// It is like `never` is a subtype of all types, `never <: T` no matter what T is.
// But not the other way around:
`let t: never = '123';` // <-- this won't compile, because I'm trying to 
// populate a type, that has no values, with a value
// No assignment to never is actually valid except another value of type never, but how do you 
// initialize first one?)
// For reference:
// https://stackoverflow.com/questions/53540282/why-is-never-assignable-to-every-type
//


// Enums:
// they map either string->string, or string->number (default, as in):
enum Language {                //   enum Language {
    Russian,                   //       Russian = 0,
    English,         // <==>            English = 1,
    Spanish = 'abc'            //       Spanish = 'abc'
};                             //   };             

// `const enum` is a bit better, you can't do Language[0] or Language[6], which can get unsafe.
// Use const enums, please. But really, don't use enums at all, because any number is an enum value in JS.
// So the sole safe way to use enums is using string literals as enum values. 
//


// Functions!
// Optionals in functions are just like in objects, but you cannot specify optional before 
// non-optional (because otherwise it would be impossible to judge what are you supplying)
function optFunction(arg: string, arg2?: string): string {
    return arg || 'none'; // compiles!
}
// function optFunction(arg?: string, arg2: string): string {
//     return arg || 'none'; // won't compile!
// }
//

// Variadic functions
function iTakeAnyNumberOfArgs(...t: number[]): number {
    return t.reduce((pr, cur) => pr + cur, 0);
} // logically, you can have only one rest parameter and it has to come last, otherwise 
// again ambiguity, what arguments should go to what parameters.

// What is the type of the function as an object?
type mySumType = (a: number, b: number) => number;
let sum: mySumType = (a, b) => { // we don't have to annotate a and b here explicitly
    return a + b;
} 

// Using `this` within functions
function iAmUsingThisSafely(this: Date): number {
    return this.getDay();
}
// function iAmTotallyUnsafe(): number {
//     return this.getDay(); // won't compile! 
// }


// Introducing alternative function type syntax:
type myOtherSumType = {
    (a: number, b: number): number 
};
let sum2: myOtherSumType = (a, b) => a + b;

// Overloading functions
// I tried to mess with it but didn't get it. Google later
// The way overloading works:
// type myCreatedElem = {
//     (a: number): string
//     (a: string): string
//     (a: any): string
// }
//
// let myCreateElem : myCreatedElem = (a: number | string | any): string => {
//     return a.toString();
// };
// let myCreateElem : myCreatedElem = (a: string): number => {
//     return '5';
// };


// Polymorphism: aka Java generics
type MyFilter = {
    <T>(array: T[], predicate: (arg: T) => boolean): T[]
};

let myFilter: MyFilter = (a, p) => {
    return a.filter(p);
};

myFilter([1, 2, 3], (a) => a % 2 == 0);
myFilter(['a', 'b', 'c'], (a) => a.startsWith('c')); // yay!
// The way this works is: typescript infers the first T it sees and
// substitutes all the remaining ones. So the only thing generics really
// do is enforce some equality of types within parameters\return value set.


// Example of bounded polymorphism:
type TreeNode<T>  = { value : T };
type LeafNode<T>  = TreeNode<T> & { isLeaf : true };
type InnerNode<T> = TreeNode<T> & 
    { children : TreeNode<T> | [TreeNode<T>, TreeNode<T>] };

type MapNode = <A, T extends TreeNode<A>, U>(node: T, f: (arg: A) => U) => TreeNode<U>

const mapNode: MapNode = (node, f) => {
    return {
        ...node,
        value: f(node.value)
    };
};


// Generics with defaults
type MyCalculation<T = number> = {
    result: T,
    operation: (a: T, b: T) => T
};
// and after that:
let myCalculation1: MyCalculation<string> = {
    result: '5',
    operation: (a, b) => a + b
};
const myCalculation2: MyCalculation = {
    result: 5, 
    operation: (a, b) => a + b
};

// Won't compile, because default type is number but string is passed.
// let myCalculation3: MyCalculation = {result: '5', operation: (a, b) => a + b};
