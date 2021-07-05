// This is the test runner.
// It does some stuff.

import importRunner from "../importRunner"

export default async (
  input: ({
    fn2Input: boolean
  } & {
    fn4Input: boolean
  }) & {
    fn2Input: boolean
  }
): Promise<
  ({ id: string; x?: boolean } & { id: string } & {
    id: string
  }) & { id: string; x?: boolean } & { id: string }
> => {
  return await importRunner({
    input,
    all: [
      import("./function1"),
      import("./function2"),
      import("./function3"),
      {
        each: [
          import("./function1"),
          import("./function2"),
          {
            route: [
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
