import {
  ImportRunnerInput,
  ImportType,
} from "./importRunnerTypes"

export async function importRunner(
  importRunnerInput: ImportRunnerInput
): Promise<any> {
  const { all, each, promise, route } = importRunnerInput
  let { input, memo } = importRunnerInput

  input = input ?? {}
  memo = memo ?? {}

  if (promise) {
    const { default: fn } = await promise

    if (fn) {
      const obj = await fn(input)
      addObjectToMemo({ input, memo, obj })
    }
  } else if (all || route) {
    const out = await Promise.all(
      (all || route).map((i) =>
        importRunner(addInput({ input, memo, addInput: i }))
      )
    )
    for (const obj of out) {
      addObjectToMemo({ input, memo, obj })
    }
  } else if (each) {
    for (const i of each) {
      const obj = await importRunner(
        addInput({ memo, input, addInput: i })
      )
      addObjectToMemo({ input, memo, obj })
    }
  }

  return memo
}

export function addObjectToMemo({
  input,
  memo,
  obj,
}: {
  input: any
  memo: any
  obj: any
}): void {
  if (typeof obj === "object" && !Array.isArray(obj)) {
    Object.assign(input, obj)
    Object.assign(memo, obj)
  }
}

export function addInput({
  memo,
  input,
  addInput,
}: {
  memo: any
  input: any
  addInput:
    | ImportRunnerInput
    | Promise<ImportType>
    | ImportType
}): ImportRunnerInput {
  return addInput["then"]
    ? {
        input,
        memo,
        promise: addInput as Promise<ImportType>,
      }
    : { input, memo, ...addInput }
}

export default importRunner
