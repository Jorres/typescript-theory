## Safely typing async code

Basic block of intuition behind asynchronous execution is the callback. 

Callback is just another function that has nothing in its type signature that would indicate this function being
asynchronous. NodeJS convention for native async API's is that the callback is usually a function with a following
signature:

```typescript
let f = (err: Error | null, res: any | null) => void;
```

But no matter how we found out about this function being asynchronous, types certainly didn't help.

### Promise from the ground up
Let's try to engineer our version of promises:

```typescript
type Executor<T, E extends Error> = (
    resolve: (res: T) => void,
    reject: (error: E) => void,
) => void;
```

We want to look at a promise and immediately find out what kind of a result this computation might return. 
So we make Promise generic:

```typescript
class Promise<T, E extends Error> { 
    constructor(f: Executor<T, E>) {}
    then<U, E2 extends Error>(f: (a: T) => Promise<U, E2>): Promise<U, E2> {}
    catch<U, E2 extends Error>(f: (a: E) => Promise<U, E2>): Promise<U, E2> {}
};
```

Fun fact: to make sure a Promise never returns with an error, you just specify:

```typescript
let a: Promise<number, never> = new Promise((resolve, reject) => {
    reject(???) // we cannot call reject because value should have type never
    // and we know `never` type is not populated with values
})
```

But by know it comes to mind that you can `throw` inside promises. Shit! It started so well. Typescript has no 
choice but to inherit Javascript behaviour where you can throw literaly anything! It means you cannot statically
guarantee what type of error will be thrown. So we'll have to loosen our requirements:

```typescript
type Executor<T> = (
    resolve: (res: T) => void,
    reject: (error: unknown) => void,
) => void;

class Promise<T> { 
    constructor(f: Executor<T>) {}
    then<U>(f: (a: T) => Promise<U>): Promise<U> {}
    catch<U>(f: (a: unknown) => Promise<U>): Promise<U> {}
};
```

If you are ambitious and have a couple of spare hours free, this [ECMAScript2015 reference](https://262.ecma-international.org/6.0/#sec-promise-objects)
is how promise state machine works under the hood.


### Async/await

Async and await are syntactic sugar in the language for working with promises.
They make the code more similar to the common code not using any complex asynchronous operations:

```typescript
let f = () => {
    api.ask()
     .then(res => console.log(res))
     .catch(err => console.log(err))
     .finally(() => console.log('finally');
}
```
^^^ would get converted into:
```typescript
let f = async () => {
    try {
        let res = await api.ask();
        console.log(res);
    } catch (err) {
        console.log(err);
    } finally {
        console.log('finally');
    }
}
```

Note that this style is immensely useful when you have to propagate results 
of multiple `then`'s, dependent on previous results, further down the flow of execution. 
Using this style, you can do just multiple `await` statements:

```typescript
let f = async () => {
    try {
        let res1 = await api.ask1();
        let res2 = await api.ask2(res1);
        let res3 = await api.ask3(res2);
        console.log(res1, res2, res3);
    } catch (err) {
        console.log(err);
    } finally {
        console.log('finally');
    }
}
```

This is not easy to rewrite into promises. Of course, you can just use variables in scope of the function, 
but this looks awkward and out of place, you end up having to think of two names per one entity - one for storage,
one for result out of promise.

### Thoughts on true parallelism

Javascript engines model asynchronous execution on a single thread with an event loop design, and that inevitably
means that any cpu-intensive operation would block your main thread execution. In case you truly want to write
parallel programs, you might opt in for [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).

These run in browser with separate threads, and because it is immensely difficult to write correct multithreaded
programs with shared memory model, they are not parallel, they are rather distributed, because their communication
happens with sending and receiving messages. 

In case you need to use parallelism in NodeJS environment, have a look at `child_process` fork API.

Section of `Programming Typescript` by Boris Cherny on WebWorkers and ChildThreads is also particularly good.
