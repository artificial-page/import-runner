import { OutType } from "io-type"
import importRunner from "../importRunner"
import importRunner1Fixture from "./importRunner1Fixture"
import importRunner2Fixture from "./importRunner2Fixture"
import importRunner3Fixture from "./importRunner3Fixture"

export default async function sourceProcessorFixture(memo: {
  hi: boolean
}): Promise<
  OutType<typeof importRunner1Fixture> &
    OutType<typeof importRunner2Fixture> &
    OutType<typeof importRunner3Fixture>
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
          import("./importRunner3Fixture"),
        ],
      },
    ],
  })
}
