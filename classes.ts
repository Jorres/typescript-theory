// How to manage classes in TS

type Type1 = 'a';
type Type2 = number;

// How to make classes with private-protected visibilities:
// Also, demonstrating readonly feature:
class A {
    public  readonly val1: Type1;
    private readonly val2: Type2;

    constructor(
        a: Type1,
        b: Type2,
    ) {
        this.val2 = b;        
    }

    f(): number {
        // this.val2 = 185; // Won't compile, it is readonly
        return this.val2 + 5;
    }
}

let a = new A('a', 10);
console.log(a.val1);
// Won't compile:
// console.log(a.val2);

// You can have abstract classes:
// They children will implement functions that you declare abstract:
abstract class CustomBifunctor<T, U, R> {
    abstract doSmth(a: T, b: U): R;
};

// For some mysterious reason, following line transpiles locally. Should not. 
// You cannot have an instance of an abstract class because how could you?? 
// const abstractInstance: CustomBifunctor<number, number, string> = null;

class Sum extends CustomBifunctor<number, number, number> {
    doSmth(a, b) { // why TS is unable to infer? :(
       return a + b;
    }
}


// Interfaces!
// This should not come with an exclamation mark, honestly. Because interfaces
// and type aliases have very much in common and you already know how to make type aliases.
// There are subtle differences, though - you can't have anything other than shape as an interface
// That makes intuitive sense, because only custom objects can comply to interfaces.
// There is no additional behaviour of number you can create without wrapping it into an object.
type attempt1 = number; // valid
// interface attempt2 = number; // invalid

// And, as expected, implementing:
interface IB {f: () => void};
class Child implements IB {
    f: () => {};
};

// Generally, implementing an interface is very similar to extending an abstract class.
// But ofc there are differences: interfaces are more lightweight, cannot have any code present 
// (even static functions) in them and therefore do not emit runtime JS code. Abstract classes 
// transpile to, well, classes, and emit their own runtime JS code. 

// What to use and when?
// If an IMPLEMENTATION is shared across multiple classes, use inheritance
// If you just need some typesafety - use interfaces.


// How to prevent people from extending your class?
// Mark constructor private and instantiate it from static fabric!
class NonExtensible {
    arg: string

    public constructor(arg: string) { this.arg = arg; }

    static create(arg: string) {
        return new NonExtensible(arg);    
    }
};

// class BadExtension extends NonExtensible {
//     // cannot extend, class constructor is marked as private!
// };

