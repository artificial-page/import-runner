import { OutType } from "io-type"
import importRunner from "../importRunner"
import function1 from "./function1"
import function2 from "./function2"
import function3 from "./function3"
import function4 from "./function4"
import function5 from "./function5"

export default async (memo: {
  hi: boolean
}): Promise<
  OutType<typeof function1> &
    OutType<typeof function2> &
    OutType<typeof function3> &
    OutType<typeof function4> &
    OutType<typeof function5>
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
