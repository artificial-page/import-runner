import function1 from "./function1"
export * from "./function1"
import { InType } from "io-type"
import testRunner from "./testRunner"
import { OutType } from "io-type"
import function2 from "./function2"
import function4 from "./function4"
import function5 from "./function5"

export default async (
  input: Record<string, never> &
    InType<typeof testRunner> &
    (OutType<typeof function1> &
      OutType<typeof function2> &
      (
        | OutType<typeof function4>
        | OutType<typeof function5>
      ))
): Promise<{ id: string }> => {
  return await function1({})
}
