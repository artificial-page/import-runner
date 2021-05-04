export const ext =
  typeof history === "undefined" ? "" : ".mjs"

export interface ImportRunnerInput {
  path?: string
  cwd?: string
  all?: ImportRunnerInput[]
  each?: ImportRunnerInput[]
  memo?: Record<string, any>
  input?: string[]
  output?: string[]
  skip?: (input: ImportRunnerInput) => boolean
}

export async function importRunner(
  importRunnerInput: ImportRunnerInput
): Promise<any> {
  const {
    cwd,
    path,
    all,
    each,
    memo,
    input,
    output,
  } = importRunnerInput

  const results = []

  if (path) {
    const { default: fn } = await import(
      (cwd ? `${cwd}/${path}` : path) + ext
    )

    if (input) {
      const arg: any = {}

      for (const key of input) {
        Object.assign(arg, memo[key])
      }

      results.push(await fn(arg))
    } else {
      results.push(await fn())
    }
  } else if (all) {
    await Promise.all(
      all.map((allInput) =>
        importRunner({
          cwd,
          memo,
          input,
          output,
          ...allInput,
        })
      )
    )
  } else if (each) {
    for (const eachInput of each) {
      await importRunner({
        cwd,
        memo,
        input,
        output,
        ...eachInput,
      })
    }
  }

  if (output) {
    for (const result of results) {
      for (const key of output) {
        Object.assign(memo[key], result)
      }
    }
  }

  return memo
}

export default importRunner
