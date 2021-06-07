import function1 from "./function1"
export * from "./function1"
import { InType, OutType } from "io-type"
import testRunner from "./testRunner"
import function2 from "./function2"

export default async (
  input: {
    fn4Input: boolean
  } & InType<typeof testRunner> &
    OutType<typeof function1> & // id, x
    OutType<typeof function2> // id
): Promise<{ id: string }> => {
  return await function1({})
}
