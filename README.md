# 👟 Import Runner

Low code control flow with dynamically imported functions

## ⚙️ Install

```bash
npm install import-runner
```

## 🏃 Run

Import runner provides a shorthand for executing complex control flows:

```typescript
import importRunner from "import-runner"

export async function thisThat(memo: { hi: boolean }): any {
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
| `all` | Concurrently execute an array of functions (may be nested) |
| `each` | Sequentially execute an array of functions (may be nested) |
| `memo` | An object that acts as input and output for function calls (root only) |

> ℹ️ Import runner looks for the default function of the import (`export default`)

> ℹ️ When in `memo` mode and a function returns an object, it is merged with the memo via `Object.assign`

## 🤖 Low code

Wait a second! What is up with the `any` output of the `importRunner` call? Did I just lose all my types?

This is where low code techniques come in. We can programmatically parse `importRunner` calls and use the control structure to:

1. Generate the output type of function calling `importRunner`
2. Generate the input type of each called function in the control flow

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