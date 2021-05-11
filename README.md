# 👟 Import Runner

Low code control flow with dynamic imports

## ⚙️ Install

```bash
npm install import-runner
```

## 🏃 Run

Import runner provides a shorthand for executing complex control flows:

```typescript
import importRunner from "import-runner"

export async function thisThat(memo: { hi: boolean }) {
  return await importRunner({
    memo,
    each: [
      import("./myFunction"),
      import("./thatFunction"),
      {
        all: [
          import("./otherFunction"),
          import("./andAnotherFunction"),
          {
            each: [
              import("./wowAnotherFunction"),
              import("./enoughFunction"),
            ],
          },
        ],
      },
    ],
  })
}
```

**Memo** an object that acts as input and output for function calls.

**All** concurrently execute an array of imports (or a nested each/all).

**Each** sequentially execute an array of imports (or a nested each/all).

## ➰ Function

Define your functions using the default export:

```typescript
export default async function ({
  hello: boolean
}): Promise<{ hello: string }> {
  if (hello) {
    return { hello: "world" }
  }
}
```

> ℹ️ Function input and output types should be inline interfaces (as opposed to a reference). You may still have references as values of the inline interface.

## 🤖 Low code

Now we can read the order of execution from `importRunner` calls programmatically and use this information to:

1. Dynamically build the output type of function calling `importRunner`
2. Validate that each function has a means of receiving the requested input

Process source files with [chokidar](https://github.com/paulmillr/chokidar):

```typescript
import { sourceProcessor } from "import-runner"
import chokidar from "chokidar"

chokidar.watch(".").on("change", (event, path) => {
  sourceProcessor(path)
})
```