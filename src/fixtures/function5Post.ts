import function1 from "./function1"
import { OutType } from "io-type"
import function2 from "./function2"
export * from "./function1"

export default async (
  input: {
    hi: boolean
  } & OutType<typeof function1> & // id, x
    OutType<typeof function2> // id
): Promise<{ id: string }> => {
  return await function1(input)
}
