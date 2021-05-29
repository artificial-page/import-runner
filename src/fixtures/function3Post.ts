import function1 from "./function1"
import testRunner from "./testRunner"
import { InType, OutType } from "io-type"
import function2 from "./function2"
import function4 from "./function4"
import function5 from "./function5"

export * from "./function1"

export default async (
  input: InType<typeof testRunner> &
    OutType<typeof function1> & // id, x
    OutType<typeof function2> & // id
    OutType<typeof function4> & // id
    OutType<typeof function5> // id
): Promise<{ id: string }> => {
  return await function1({})
}
