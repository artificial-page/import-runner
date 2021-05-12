import { OutType } from "io-type"
import importRunner from "./importRunner"
import importRunnerFixture from "./importRunnerFixture"
import importRunnerFixture2 from "./importRunnerFixture2"

export async function runner(memo: {
  hi: boolean
}): Promise<
  OutType<typeof importRunnerFixture> &
    OutType<typeof importRunnerFixture2>
> {
  return await importRunner({
    memo,
    all: [
      import("./importRunnerFixture"),
      import("./importRunnerFixture2"),
      {
        each: [
          import("./importRunnerFixture"),
          import("./importRunnerFixture2"),
        ],
      },
    ],
  })
}
