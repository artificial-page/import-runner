import { InType, OutType } from "io-type"
import sourceProcessorFixture from "./sourceProcessorFixture"

import importRunner1Fixture from "./importRunner1Fixture"
export * from "./importRunner1Fixture"

export default async (
  input: InType<typeof sourceProcessorFixture> &
    OutType<typeof importRunner1Fixture> // id, x
): Promise<{ id: string }> => {
  return await importRunner1Fixture(input)
}
