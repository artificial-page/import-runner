import path from "path"
import { ReplacementOutputType } from "file-replacer"
import outTypes from "../coders/outTypes"
import { regex } from "../parsers/defaultFunction"

export default ({
  flowPathsUnique,
}: {
  flowPathsUnique: string[]
}): ReplacementOutputType => {
  const basenames = flowPathsUnique.map((str) =>
    path.basename(str)
  )

  return [
    {
      replace: (m, p1, p2, p3, p4, p5) => {
        const x = `${p1}${p2}${p3}${p4}${
          p5.match(/^Promise</) ? "Promise<" : ""
        }\n  ${outTypes({ basenames })}\n${
          p5.match(/^Promise</) ? ">" : ""
        }`
        return x
      },
      search: regex,
    },
  ]
}
