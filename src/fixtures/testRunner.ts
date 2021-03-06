// This is the test runner.
// It does some stuff.

import importRunner from "../importRunner"

export default async (
  input: Record<string, never> = {}
): Promise<any> => {
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
