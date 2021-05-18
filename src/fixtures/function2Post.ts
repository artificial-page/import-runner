import function1 from "./function1"
import { OutType } from "io-type"
export * from "./function1"

export default async (
  input: {
    hi: boolean
  } & OutType<typeof function1> // id, x
): Promise<{ id: string }> => {
  return await function1(input)
}
