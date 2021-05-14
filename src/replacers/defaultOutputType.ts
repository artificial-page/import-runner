import { regex } from "../parsers/defaultOutputType"
import { ReplacementOutputType } from "file-replacer"

export default ({
  importVarName,
  outputTypes,
}: {
  importVarName: string
  outputTypes: string
}): ReplacementOutputType => [
  {
    replace: (m, p1, p2) =>
      `}): Promise<\n  ${outputTypes}\n> {${p2}`,
    search: new RegExp(
      `${regex}(.+)(?=${importVarName}\\({)`,
      "s"
    ),
  },
]
