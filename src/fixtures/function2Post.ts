import function1 from "./function1"
export * from "./function1"
import { InType, OutType } from "io-type"
import testRunner from "./testRunner"

export default async (
  input: {
    fn2Input: boolean
  } & InType<typeof testRunner> &
    OutType<typeof function1> // id, x
): Promise<{ id: string }> => {
  return await function1({})
}
