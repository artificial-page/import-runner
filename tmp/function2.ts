import function1 from "./function1"
export * from "./function1"
import testRunner from "./testRunner"
import { InType, OutType } from "io-type"

export default async (
  input: {
    fn2Input: boolean
  } & InType<typeof testRunner> &
    OutType<typeof function1> // id, x
): Promise<{ id: string }> => {
  return await function1({})
}
