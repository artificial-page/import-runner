import function1 from "./function1"
import { InOutType } from "io-type"
import function2 from "./function2"
import function4 from "./function4"
import function5 from "./function5"
export * from "./function1"

export default async (
  input: InOutType<typeof function1> & // id, x
    InOutType<typeof function2> & // id
    InOutType<typeof function4> & // id
    InOutType<typeof function5> // id
): Promise<{ id: string }> => {
  return await function1(input)
}
