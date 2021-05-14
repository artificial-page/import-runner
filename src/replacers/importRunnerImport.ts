import { regex } from "../parsers/importRunnerImport"
import { ReplacementOutputType } from "file-replacer"

export default ({
  imports,
}: {
  imports: string[]
}): ReplacementOutputType => [
  {
    replace: (m, p1, p2) =>
      [`import ${p1} from "${p2}"`, ...imports].join("\n"),
    search: regex,
  },
  {
    replace: (m, p1, p2) =>
      [
        'import { OutType } from "io-type"',
        `import ${p1} from "${p2}"`,
      ].join("\n"),
    search: regex,
    condition: (body) => !body.match(/\sOutType\s/),
  },
]
