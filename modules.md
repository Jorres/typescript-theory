### Modules

Back in 1995, there was no native module support in JS, and everything was declared in global namespace.
This quickly got messy, and then some people decided to load modules asynchronously (because loading a lot of 
js in one go blocks browser UI thread and user got frustrated).


#### CommonJS 

NodeJS was being developed around the same time, and their creators learned their lesson from pain that was
going on in browser JS, integrating a module standard right into the framework. The solution that was called 
CommonJS looked like this:


```typescript
var a = require('fun1');
var b = require('fun2');

module.exports.c = function () {...}
```

CommonJS became defacto standard of javascript module bundling, although it has some drawbacks.
Require and export call can appear anywhere, even in dead code branches, and contain ARBITRARY STRINGS!!! OMG!!

####ES2015

ES2015 introduced new standard for modules that was statically analyzable.  It looks like this:

```typescript
import {fun1} from 'fun1Container';
import {fun2} from 'fun1Container';

export function fun3() {

}
```

#### Default export

You can export only one thing per module and user can export it without curly braces and using any name 
he likes: 

```typescript
// a.ts
export default function fun1() {}

// where using:
import myArbitraryName from "./a";
```

Thus it is not possible to export several values with default exporting, because then you miss the point.

#### Export\import all

We can use wildcard * to export\import every top-level declaration a module contains:

```typescript
// a.ts
let fun1 = () => {}
let fun2 = () => {}
let fun3 = () => {}
export * from './a';

// where using:
import * as a from './a';
a.fun1();
a.fun2();
```

In Typescript, you can export and import types and interfaces as well. Since they do not share namespace
with values, by exporting one name you can import two - value (e.g. object, or function) and type. TS
will figure out what you mean based on where you use the identifier.

### Notes on lazy loading

The bigger the application, the bigger the amount of code you are loading. This leads to lazy loading - loading
on demand. Applications by Google or Facebook use this concept simply because they have no other choice - 
otherwise users would download the whole codebase which is gigabytes.

The concept is formalized in ES2015 so you can have a dynamic import:

```typescript
let myUtilities = await import('./my-utilities');
```
To use this, you need to enable `{"module": "esnext"}` in compilerOptions.

### Module mode vs script mode

Typescript parses your source code files in one of two modes: module or script. If your file has `import`'s or 
`export`'s, then you are in module mode, script mode otherwise. Script mode automatically makes all your top-level
declarations visible to other files.


Script mode is useful when quickly prototyping something that probably would never be used with module system anyway
 (look for `{"module": "none"}` in compilerOptions).

Another use case for script mode is for declaring types. There is almost no harm in allowing everyone to look
through your types, right?..

### Namespaces

Another way to model encapsulation in Typescript is to use namespaces. 

```typescript
namespace Network {
    export function Get() {}

    export namespace UDP {
        export function UDPGet () {}
    }
    
    somePrivateFunction () {} // will not be seen by other files
}
```
Typescript does not allow collision by namespaces and their subcomponents.

Namespaces compile to IIFE (closures) to avoid exposing their intestines. Root namespaces are compiled to
top-level declarations.


It is better in general to stick with modules than with namespaces, because that way you have to define your 
dependencies explicitly. This is the same as using global variable - it is not obvious your function is 
dependant on some extra information, not mentioned in its signature.

### Reminder on declaration merging

Remember that types and values live in different namespaces? This happens to extend even further. Instead
 of a type, you can use any type-like entity to implement companion object pattern. For example, namespace!

Not sure that it will come in handy though. The most obvious pattern is value-type and by going further you
will make another person investigate what is going on in your code!
