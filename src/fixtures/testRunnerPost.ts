// This is the test runner.
// It does some stuff.

import importRunner from "../importRunner"

export default async (
  memo: (Record<string, never> & {
    fn2Input: boolean
  } & (
      | {
          fn4Input: boolean
        }
      | Record<string, never>
    ) &
    Record<string, never>) &
    Record<string, never> & {
      fn2Input: boolean
    } & Record<string, never>
): Promise<
  ((Record<string, never> & { id: string; x?: boolean }) &
    ({
      fn2Input: boolean
    } & { id: string }) &
    (
      | ({
          fn4Input: boolean
        } & { id: string })
      | (Record<string, never> & { id: string })
    ) &
    (Record<string, never> & { id: string })) &
    (Record<string, never> & { id: string; x?: boolean }) &
    ({
      fn2Input: boolean
    } & { id: string }) &
    (Record<string, never> & { id: string })
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
