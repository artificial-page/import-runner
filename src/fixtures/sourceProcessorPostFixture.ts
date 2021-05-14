import { OutType } from "io-type"
import importRunner from "../importRunner"
import importRunnerFixture from "./importRunnerFixture"
import importRunner2Fixture from "./importRunner2Fixture"
import importRunner3Fixture from "./importRunner3Fixture"

export default async function sourceProcessorFixture(memo: {
  hi: boolean
}): Promise<
  OutType<typeof importRunnerFixture> &
    OutType<typeof importRunner2Fixture> &
    OutType<typeof importRunner3Fixture>
> {
  return await importRunner({
    memo,
    all: [
      import("./importRunnerFixture"),
      import("./importRunner2Fixture"),
      import("./importRunner3Fixture"),
      {
        each: [
          import("./importRunnerFixture"),
          import("./importRunner2Fixture"),
          import("./importRunner3Fixture"),
        ],
      },
    ],
  })
}
