import { regex } from "../parsers/importRunnerImport"
import { ReplacementOutputType } from "file-replacer"

export default ({
  imports,
}: {
  imports: string[]
}): ReplacementOutputType => [
  ...imports
    .reverse()
    .map((str): ReplacementOutputType[0] => {
      return {
        replace: (m, p1, p2) =>
          [`import ${p1} from "${p2}"`, str].join("\n"),
        search: regex,
        condition: (body) => !body.includes(str),
      }
    }),
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
