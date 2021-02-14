### Disclaimer

This is only useful if you have a part of your codebase in TS and part of JS. 

### Safely migrating from JS

There will be many more usecases for when you'll start with an island of type safety in a type-less sea 
than for creating a TS application from the start.

There are some problems that might arise when trying to type only part of your code.

### Type declarations

They are files having extension `*.d.ts` that contain type declarations for otherwise untyped javascript code.
You cannot have any value declarations in these files, and thus they exist only at compile time to ensure type 
safety.

In large libraries that makes a lot of sense. You can write `*.ts` code, then compile it to publish to NPM, but
you'd still need to supply type information for your users, who don't want to recompile your library on their
own, but want to have your typings in order to use it in their applications.

You might want to use these to type something that is widely used throughout your application to
avoid explicitly importing them.

#### Ambient variable declaration 

These constructs lets you say things like 'I have global variable and it has these properties':
```typescript
declare let process = {
    env: {
        NODE_ENV: 'production' | 'development'
    }
}
```

#### Ambient type declaration 
These constructs lets you say things like 'I have type that we can use everywhere now':
```typescript
type toArray<T> = T extends unknown[] ? T : T[];
```

#### Ambient module declaration

When you consume some module in TS code but it originally is in JS, you have to explicitly type it.

```typescript
declare module moduleName {
    export type MyNum = number
    export const f: () => void;
}
```

There is a whole wonderful guide on what steps to take when you want to migrate your codebase to TS from JS, in 
'Programming Typescript' by Boris Cherny, look for `Gradually migrating from JavaScript to TypeScript`.


### Definitely Typed

It is a centralized, community-maintained repository with ambient type declarations for open-source javascript 
projects. The probability of type declarations from this place being out-of-date or incomplete is higher than 
if types were written by developers of the package itself, but it can still be a lot of help.

The pattern is as follows: for NPM package `packageName` there exists package `@types/packageName` with ambient 
type declarations.

Try to contribute to this place so others could take advantage of your hard work.

There is also an ongoing research on how to generate type declarations for third-party javascript modules
(TypeScript, after all, is a language that is able to infer some information). Check out `dts-gen`.
