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

| Option | Description |
| :--- | :--- |
| `all` | Concurrently execute an array of imports (may be nested) |
| `each` | Sequentially execute an array of imports (may be nested) |
| `memo` | An object that acts as input and output for function calls |

## ➰ Functions

Define your functions using the default export:

```typescript
export default (): void => {}
```

Use `OutType` to reference previous function outputs as the input:

```typescript
import { OutType } from "io-type"
import myFunction from "./myFunction"
import thatFunction from "./thatFunction"

export default async function otherFunction({
  myOption,
  thatOption,
}: OutType<typeof myFunction> &
  OutType<typeof thatFunction>
): Promise<{ hello: string }> {
  return myOption
    ? { hello: "my world" }
    : thatOption
      ? { hello: "that world" }
      : { hello: "world" }
}
```

## 🤖 Low code

Now we can programmatically parse `importRunner` calls and use this information to:

1. Dynamically build the output type of function calling `importRunner`
2. Validate that each function has a means of receiving the requested input

Example code to process source files with [chokidar](https://github.com/paulmillr/chokidar), [file-replacer](https://github.com/artificial-page/file-replacer), and [fs-extra](https://github.com/jprichardson/node-fs-extra):

```typescript
import chokidar from "chokidar"
import fileReplacer from "file-replacer"
import fsExtra from "fs-extra"
import sourceProcessor from "import-runner/dist/cjs/sourceProcessor"

chokidar.watch(".").on("change", (event, path) => {
  sourceProcessor({ fileReplacer, fsExtra, path })
})
```