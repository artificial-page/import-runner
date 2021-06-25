import function1 from "./function1"
export * from "./function1"
import { OutType } from "io-type"
import { InType } from "io-type"
import testRunner from "./testRunner"
import function2 from "./function2"

export default async (
  input: InType<typeof testRunner> &
    (OutType<typeof function1> & OutType<typeof function2>)
): Promise<{ id: string }> => {
  return await function1()
}
