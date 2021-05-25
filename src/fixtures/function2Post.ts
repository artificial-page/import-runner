import function1 from "./function1"
import { InOutType } from "io-type"
export * from "./function1"

export default async (
  input: InOutType<typeof function1> // id, x
): Promise<{ id: string }> => {
  return await function1(input)
}
