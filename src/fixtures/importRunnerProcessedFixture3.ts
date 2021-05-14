import { InType, OutType } from "io-type"
import sourceProcessorFixture from "./sourceProcessorFixture"
import importRunnerFixture2 from "./importRunnerFixture2"

import importRunnerFixture from "./importRunnerFixture"
export * from "./importRunnerFixture"

export default async (
  input: InType<typeof sourceProcessorFixture> &
    OutType<typeof importRunnerFixture> & // id, x
    OutType<typeof importRunnerFixture2> // id
): Promise<{ id: string }> => {
  return await importRunnerFixture(input)
}
