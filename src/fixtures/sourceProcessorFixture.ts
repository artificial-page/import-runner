import importRunner from "../importRunner"

export default async function sourceProcessorFixture(memo: {
  hi: boolean
}): Promise<any> {
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
