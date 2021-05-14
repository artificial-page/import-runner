import { InType, OutType } from "io-type"
import sourceProcessorFixture from "./sourceProcessorFixture"
import importRunner2Fixture from "./importRunner2Fixture"

import importRunnerFixture from "./importRunnerFixture"
export * from "./importRunnerFixture"

export default async (
  input: InType<typeof sourceProcessorFixture> &
    OutType<typeof importRunnerFixture> & // id, x
    OutType<typeof importRunner2Fixture> // id
): Promise<{ id: string }> => {
  return await importRunnerFixture(input)
}
