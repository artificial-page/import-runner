# 👟 Import Runner

Dynamically import and run functions (even on client side!)

## ⚙️ Install

```bash
npm install import-runner
```

## 🏃 Run

Import runner provides a shorthand for executing somewhat complex control flows:

```typescript
import run from "import-runner"

(async () => {
  await run({
    cwd: __dirname,
    each: [
      { path: "myFunction" },
      { path: "thatFunction" },
      {
        all: [
          { path: "otherFunction" },
          { path: "andAnotherFunction" },
          {
            each: [
              { path: "wowAnotherFunction" },
              { path: "enoughFunction" },
            ],
          },
        ],
      },
    ],
  })
})()
```

| Option | Description | Type |
| :--- | :--- | :--- |
| `cwd` | Working directory | `string` |
| `each` | Sequentially execute an array of functions | `ImportRunnerInput[]` |
| `all` | Concurrently execute an array of functions | `ImportRunnerInput[]` |

## 🤖 Function

Define your functions using the default export:

```typescript
export default async () => {
  // do something
}
```

## ⛷️ More options

```typescript
import run from "import-runner"

(async () => {
  const memo = await run({
    cwd: __dirname,
    memo: { default: {} },
    input: ["default"],
    output: ["default"],
    each: [
      { path: "thisFunction" },
      { path: "thatFunction" },
    ],
  })
})()
```

| Option | Description | Type |
| :--- | :--- | :--- |
| `memo` | Memo default values | `Record<string, any>` |
| `input` | Memos to use as function inputs | `string[]` |
| `output` | Memos to store function outputs | `string[]` |

> ℹ️ Options may exist at any depth in the control structure.

> ℹ️ Parent options apply to child functions until overwritten.

## ♻️ Client side

When running in the browser, import runner automatically adds `.mjs` extensions to your path.

You'll likely still need to change the `cwd` option on the client to point to your assets directory.