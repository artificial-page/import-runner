import {
  ImportRunnerInput,
  ImportType,
} from "./importRunnerTypes"

export async function importRunner(
  importRunnerInput: ImportRunnerInput | Promise<ImportType>
): Promise<Record<string, any>> {
  let promise: Promise<any>
  let { all, each, memo }: ImportRunnerInput = {}

  if (importRunnerInput["then"]) {
    promise = importRunnerInput as Promise<any>
  } else {
    ;({ all, each, memo, promise } =
      importRunnerInput as ImportRunnerInput)
  }

  memo = memo ?? {}

  if (promise) {
    const { default: fn } = await promise

    if (fn) {
      const out = await fn(memo)
      Object.assign(memo, out)
    }
  } else if (all) {
    const out = await Promise.all(
      all.map((input) =>
        importRunner(
          input["then"]
            ? {
                memo,
                promise: input as Promise<ImportType>,
              }
            : { memo, ...input }
        )
      )
    )
    for (const obj of out) {
      Object.assign(memo, obj)
    }
  } else if (each) {
    for (const input of each) {
      const out = await importRunner(
        input["then"]
          ? {
              memo,
              promise: input as Promise<ImportType>,
            }
          : { memo, ...input }
      )
      Object.assign(memo, out)
    }
  }

  return memo
}

export default importRunner
