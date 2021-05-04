export const ext =
  typeof history === "undefined" ? "" : ".mjs"

export interface ImportRunnerInput {
  path?: string
  arg?: any
  cwd?: string
  all?: ImportRunnerInput[]
  each?: ImportRunnerInput[]
  memo?: boolean
  skip?: (input: ImportRunnerInput) => boolean
}

export async function importRunner({
  arg,
  cwd,
  all,
  each,
  memo,
  skip,
}: Exclude<ImportRunnerInput, "path">): Promise<any> {
  let caller: (input: ImportRunnerInput) => any

  if (all || each) {
    caller = (input) => {
      return importRunnerCaller({
        path: input.path,
        all: input.all,
        each: input.each,
        arg:
          input.memo ?? memo
            ? memoArg({ arg, out: input.arg })
            : input.arg ?? arg,
        cwd: input.cwd ?? cwd,
        memo: input.memo ?? memo,
        skip: input.skip ?? skip,
      })
    }
  }

  if (all) {
    const outputs = await Promise.all(
      all.map(caller).filter((p) => p !== undefined)
    )

    if (memo) {
      for (const out of outputs) {
        arg = memoArg({ arg, out })
      }
    }
  }

  if (each) {
    let out: any

    for (const input of each) {
      out = await caller(input)

      if (memo) {
        arg = memoArg({ arg, out })
      }
    }
  }

  return arg
}

export function memoArg({
  arg,
  out,
}: {
  arg: any
  out: any
}): any {
  if (arg === undefined || out === undefined) {
    return out ?? arg
  }

  if (Array.isArray(arg) && Array.isArray(out)) {
    arg = arg.concat(out)
  } else if (
    typeof arg === "object" &&
    typeof out === "object"
  ) {
    arg = Object.assign({}, arg, out)
  }

  return arg
}

export async function importRunnerCaller(
  input: ImportRunnerInput
): Promise<any> {
  const { path, arg, cwd, skip } = input

  if (path) {
    if (typeof skip === "function" && skip(input)) {
      return arg
    }

    const { default: fn } = await import(
      (cwd ? `${cwd}/${path}` : path) + ext
    )

    return await fn(arg)
  } else {
    return await importRunner(input)
  }
}

export default importRunner
