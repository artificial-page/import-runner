import {
  ImportRunnerInput,
  ImportType,
} from "./importRunnerTypes"

export async function importRunner(
  importRunnerInput: ImportRunnerInput
): Promise<Record<string, any>> {
  const { all, each, promise } = importRunnerInput
  let { memo } = importRunnerInput

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
        importRunner(addMemoToInput({ memo, input }))
      )
    )
    for (const obj of out) {
      Object.assign(memo, obj)
    }
  } else if (each) {
    for (const input of each) {
      const out = await importRunner(
        addMemoToInput({ memo, input })
      )
      Object.assign(memo, out)
    }
  }

  return memo
}

export function addMemoToInput({
  memo,
  input,
}: {
  memo: Record<string, any>
  input: ImportRunnerInput | Promise<ImportType>
}): ImportRunnerInput {
  return input["then"]
    ? {
        memo,
        promise: input as Promise<ImportType>,
      }
    : { memo, ...input }
}

export default importRunner
