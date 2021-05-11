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

## ➰ Function

Define your functions using the default export:

```typescript
import { OutType } from "io-type"
import myFunction from "./myFunction"
import thatFunction from "./thatFunction"

export default async function otherFunction({
  myOutput,
  thatOutput,
}: OutType<typeof myFunction> &
  OutType<typeof thatFunction>
): Promise<{ hello: string }> {
  const prefix: string = ""
  
  if (myOutput) {
    prefix = "my "
  } else if (thatOutput) {
    prefix = "that "
  }
  
  return { hello: `${prefix}world` }
}
```

> ℹ️ Use `InType` and `OutType` to reference previous function inputs & outputs

## 🤖 Low code

Now we can programmatically parse `importRunner` calls and use this information to:

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