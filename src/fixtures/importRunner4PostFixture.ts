import { OutType } from "io-type"
import importRunner2Fixture from "./importRunner2Fixture"
import importRunner1Fixture from "./importRunner1Fixture"
export * from "./importRunner1Fixture"

export default async (
  input: {
    hi: boolean
  } & OutType<typeof importRunner1Fixture> & // id, x
    OutType<typeof importRunner2Fixture> // id
): Promise<{ id: string }> => {
  return await importRunner1Fixture(input)
}
