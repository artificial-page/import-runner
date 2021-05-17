import { OutType } from "io-type"
import function2 from "./function2"
import function4 from "./function4"
import function5 from "./function5"
import function1 from "./function1"
export * from "./function1"

export default async (
  input: {
    hi: boolean
  } & OutType<typeof function1> & // id, x
    OutType<typeof function2> & // id
    OutType<typeof function4> & // id
    OutType<typeof function5> // id
): Promise<{ id: string }> => {
  return await function1(input)
}
