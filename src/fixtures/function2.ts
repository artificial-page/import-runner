// Example docs.

import function1 from "./function1"
export * from "./function1"

export default async function function2(input: {
  fn2Input: boolean
}): Promise<{ id: string }> {
  return await function1()
}
