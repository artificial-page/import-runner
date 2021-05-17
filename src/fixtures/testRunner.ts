import importRunner from "../importRunner"

export default async (memo: {
  hi: boolean
}): Promise<any> => {
  return await importRunner({
    memo,
    all: [
      import("./function1"),
      import("./function2"),
      import("./function3"),
      {
        each: [
          import("./function1"),
          import("./function2"),
          {
            all: [
              import("./function4"),
              import("./function5"),
            ],
          },
          import("./function3"),
        ],
      },
    ],
  })
}
