# 👟 Import runner

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
      { path: "thisFunction" },
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

| Option | Description |
| :--- | :--- |
| `cwd` | Working directory to find functions |
| `each` | Execute functions in succession (one after the other) |
| `all` | Execute functions concurrently (all at once) |

## ⛷️ More options

```typescript
import run from "import-runner"

(async () => {
  const memo = await run({
    cwd: __dirname,
    arg: {},
    memo: true,
    each: [
      { path: "thisFunction", arg: { hi: true } },
      { path: "thatFunction" },
    ],
    skip: ({ path }) => path === "thatFunction",
  })
})()
```

| Option | Description |
| :--- | :--- |
| `arg` | Function argument (must be object or array in `memo` mode) |
| `memo` | Memoize function return values (`arg` is the starting value) |
| `skip` | Custom function skip condition |

> ℹ️ Options may exist at any depth, and apply to all child functions unless overwritten.

> ℹ️ Child `arg` options are merged if they are similar types and `memo: true`.

## ♻️ Client side

When running in the browser, import runner automatically adds `.mjs` extensions to your path.

You'll likely still need to change the `cwd` option on the client to point to your assets directory.