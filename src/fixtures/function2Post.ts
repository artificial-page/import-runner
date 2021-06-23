// Example docs.

import function1 from "./function1"
export * from "./function1"
import { InType } from "io-type"
import testRunner from "./testRunner"
import { OutType } from "io-type"

export default async (
  input: {
    fn2Input: boolean
  } & InType<typeof testRunner> &
    OutType<typeof function1>
): Promise<{ id: string }> => {
  return await function1({})
}
