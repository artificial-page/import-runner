import { ReplacementOutputType } from "file-replacer"
import outTypes from "../coders/outTypes"
import { regex } from "../parsers/defaultFunction"
import { FlowPath } from "sourceProcessor"

export default ({
  prevImportPaths,
}: {
  prevImportPaths: FlowPath[]
}): ReplacementOutputType => {
  const basenames = prevImportPaths.map(
    ({ importPathBase }) => importPathBase
  )

  return [
    {
      replace: (m, p1, p2, p3, p4, p5) => {
        const x = `${p1}${p2}${p3}${p4}${
          p5.match(/^Promise</) ? "Promise<" : ""
        }\n  ${outTypes({ basenames }) || "any"}\n${
          p5.match(/^Promise</) ? ">" : ""
        }`
        return x
      },
      search: regex,
    },
  ]
}
