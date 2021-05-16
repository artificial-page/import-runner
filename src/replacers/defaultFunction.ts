import { regex } from "../parsers/defaultFunction"
import { ReplacementOutputType } from "file-replacer"

export default ({
  outputTypes,
}: {
  outputTypes: string
}): ReplacementOutputType => [
  {
    replace: (m, p1, p2, p3, p4, p5) => {
      const x = `${p1}${p2}${p3}${p4}${
        p5.match(/^Promise</) ? "Promise<" : ""
      }\n  ${outputTypes}\n${
        p5.match(/^Promise</) ? ">" : ""
      }`
      return x
    },
    search: regex,
  },
]
