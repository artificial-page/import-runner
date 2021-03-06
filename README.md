# đ Import Runner

Low code control flow with dynamically imported functions

## âī¸ Install

```bash
npm install import-runner
```

## đ Run

Import runner provides a shorthand for executing complex control flows using dynamic imports:

```typescript
import importRunner from "import-runner"

export async function thisThat(input: {
  hi: boolean
}): Promise<any> {
  return await importRunner({
    input,
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

> âšī¸ Import runner calls the default function of the dynamic import (`export default`)

> âšī¸ If a function call returns an object, it is assigned to the memo (`Object.assign`)

| Option  | Description                                                |
| :------ | :--------------------------------------------------------- |
| `all`   | Concurrently execute an array of functions (may be nested) |
| `each`  | Sequentially execute an array of functions (may be nested) |
| `input` | Input object                                               |

## đ¤ Low code

Wait a second! What is up with the `any` output of the `importRunner` call? Did I just lose all my types?

This is where low code techniques come in. We can programmatically parse `importRunner` calls and use the control structure to:

1. Generate the output type of function calling `importRunner`
2. Generate the input type of each called function in the control flow

Example code to process source files with [chokidar](https://github.com/paulmillr/chokidar), [eslint](https://github.com/eslint/eslint) (optional), [file-replacer](https://github.com/artificial-page/file-replacer), and [fs-extra](https://github.com/jprichardson/node-fs-extra):

```typescript
import chokidar from "chokidar"
import { ESLint } from "eslint"
import fileReplacer from "file-replacer"
import fsExtra from "fs-extra"
import sourceProcessor from "import-runner/dist/cjs/sourceProcessor"

chokidar.watch(".").on("change", (event, path) => {
  sourceProcessor({
    eslint: new ESLint({ fix: true }),
    fileReplacer,
    fsExtra,
    path,
  })
})
```
