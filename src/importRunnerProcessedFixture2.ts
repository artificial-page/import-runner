import { InType, OutType } from "io-type"
import sourceProcessorFixture from "./sourceProcessorFixture"

import importRunnerFixture from "./importRunnerFixture"
export * from "./importRunnerFixture"

export default async (
  input: InType<typeof sourceProcessorFixture> &
    OutType<typeof importRunnerFixture> // id, x
): Promise<{ id: string }> => {
  return await importRunnerFixture(input)
}
