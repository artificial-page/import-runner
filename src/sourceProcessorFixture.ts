import importRunner from "./importRunner"

export default async function sourceProcessorFixture(memo: {
  hi: boolean
}): Promise<Record<string, any>> {
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
