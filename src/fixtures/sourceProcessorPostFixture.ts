import { OutType } from "io-type"
import importRunner from "../importRunner"
import importRunnerFixture from "./importRunnerFixture"
import importRunnerFixture2 from "./importRunnerFixture2"
import importRunnerFixture3 from "./importRunnerFixture3"

export default async function sourceProcessorFixture(memo: {
  hi: boolean
}): Promise<
  OutType<typeof importRunnerFixture> &
    OutType<typeof importRunnerFixture2> &
    OutType<typeof importRunnerFixture3>
> {
  return await importRunner({
    memo,
    all: [
      import("./importRunnerFixture"),
      import("./importRunnerFixture2"),
      import("./importRunnerFixture3"),
      {
        each: [
          import("./importRunnerFixture"),
          import("./importRunnerFixture2"),
          import("./importRunnerFixture3"),
        ],
      },
    ],
  })
}
