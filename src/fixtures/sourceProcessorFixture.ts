import importRunner from "../importRunner"

export default async (memo: {
  hi: boolean
}): Promise<any> => {
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
