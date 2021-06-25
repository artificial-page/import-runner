// This is the test runner.
// It does some stuff.

import importRunner from "../importRunner"

export default async (
  memo: ({
    fn2Input: boolean
  } & {
    fn4Input: boolean
  }) & {
    fn2Input: boolean
  }
): Promise<
  (({
    fn2Input: boolean
  } & { id: string }) &
    (
      | ({
          fn4Input: boolean
        } & { id: string })
      | { id: string }
    )) & { id: string; x?: boolean } & ({
      fn2Input: boolean
    } & { id: string }) & { id: string }
> => {
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
