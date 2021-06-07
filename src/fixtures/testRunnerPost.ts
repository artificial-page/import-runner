// This is the test runner.
// It does some stuff.

import importRunner from "../importRunner"

export default async (
  memo: {
    // function2 input
    fn2Input: boolean
  } & {
    // function4 input
    fn4Input: boolean
  }
): Promise<
  {
    // function2 input
    fn2Input: boolean
  } & {
    // function4 input
    fn4Input: boolean
  } & {
    // function1 output
    id: string
    x?: boolean
  } & {
    // function2 output
    id: string
  } & {
    // function4 output
    id: string
  } & {
    // function5 output
    id: string
  } & {
    // function3 output
    id: string
  }
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
