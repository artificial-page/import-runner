import {
  ImportRunnerInput,
  ImportType,
} from "./importRunnerTypes"

export async function importRunner(
  importRunnerInput: ImportRunnerInput
): Promise<any> {
  const { all, each, promise } = importRunnerInput
  let { memo } = importRunnerInput

  memo = memo ?? {}

  if (promise) {
    const { default: fn } = await promise

    if (fn) {
      const obj = await fn(memo)
      addObjectToMemo({ memo, obj })
    }
  } else if (all) {
    const out = await Promise.all(
      all.map((input) =>
        importRunner(addMemoToInput({ memo, input }))
      )
    )
    for (const obj of out) {
      addObjectToMemo({ memo, obj })
    }
  } else if (each) {
    for (const input of each) {
      const obj = await importRunner(
        addMemoToInput({ memo, input })
      )
      addObjectToMemo({ memo, obj })
    }
  }

  return memo
}

export function addObjectToMemo({
  memo,
  obj,
}: {
  memo: any
  obj: any
}): void {
  if (typeof obj === "object" && !Array.isArray(obj)) {
    Object.assign(memo, obj)
  }
}

export function addMemoToInput({
  memo,
  input,
}: {
  memo: any
  input:
    | ImportRunnerInput
    | Promise<ImportType>
    | ImportType
}): ImportRunnerInput {
  return input["then"]
    ? {
        memo,
        promise: input as Promise<ImportType>,
      }
    : { memo, ...input }
}

export default importRunner
