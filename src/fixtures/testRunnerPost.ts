import importRunner from "../importRunner"
import { InType, InOutType } from "io-type"
import function1 from "./function1"
import function2 from "./function2"
import function4 from "./function4"
import function5 from "./function5"
import function3 from "./function3"

export default async (
  memo: InType<typeof function1> &
    InType<typeof function2> &
    InType<typeof function4> &
    InType<typeof function5> &
    InType<typeof function3>
): Promise<
  InOutType<typeof function1> &
    InOutType<typeof function2> &
    InOutType<typeof function4> &
    InOutType<typeof function5> &
    InOutType<typeof function3>
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
