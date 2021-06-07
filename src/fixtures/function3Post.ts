import function1 from "./function1"
export * from "./function1"
import { InType, OutType } from "io-type"
import testRunner from "./testRunner"
import function2 from "./function2"
import function4 from "./function4"
import function5 from "./function5"

export default async (
  input: InType<typeof testRunner> &
    OutType<typeof function1> & // id, x
    OutType<typeof function2> & // id
    OutType<typeof function4> & // id
    OutType<typeof function5> // id
): Promise<{ id: string }> => {
  return await function1({})
}
