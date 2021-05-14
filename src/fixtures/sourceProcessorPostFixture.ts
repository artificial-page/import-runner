import { OutType } from "io-type"
import importRunner from "../importRunner"
import importRunner1Fixture from "./importRunner1Fixture"
import importRunner2Fixture from "./importRunner2Fixture"
import importRunner3Fixture from "./importRunner3Fixture"
import importRunner4Fixture from "./importRunner4Fixture"
import importRunner5Fixture from "./importRunner5Fixture"

export default async function sourceProcessorFixture(memo: {
  hi: boolean
}): Promise<
  OutType<typeof importRunner1Fixture> &
    OutType<typeof importRunner2Fixture> &
    OutType<typeof importRunner3Fixture> &
    OutType<typeof importRunner4Fixture> &
    OutType<typeof importRunner5Fixture>
> {
  return await importRunner({
    memo,
    all: [
      import("./importRunner1Fixture"),
      import("./importRunner2Fixture"),
      import("./importRunner3Fixture"),
      {
        each: [
          import("./importRunner1Fixture"),
          import("./importRunner2Fixture"),
          {
            all: [
              import("./importRunner4Fixture"),
              import("./importRunner5Fixture"),
            ],
          },
          import("./importRunner3Fixture"),
        ],
      },
    ],
  })
}
