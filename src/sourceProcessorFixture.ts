import importRunner from "./importRunner"

export async function runner(memo: {
  hi: boolean
}): Promise<Record<string, any>> {
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