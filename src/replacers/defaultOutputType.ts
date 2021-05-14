import { regex } from "../parsers/defaultOutputType"
import { ReplacementOutputType } from "file-replacer"

export default ({
  outputTypes,
}: {
  outputTypes: string
}): ReplacementOutputType => [
  {
    replace: (m, p1, p2, p3, p4, p5, p6, p7, p8, p9) =>
      `${p1}${p2}${p3}${p4}${p5}\n  ${outputTypes}\n${p7}${p8}${p9}`,
    search: regex,
  },
]
