import path from "path"
import { ReplacementOutputType } from "file-replacer"
import outTypeImport from "../coders/outTypeImport"
import { regex } from "../parsers/importRunnerImport"

export default ({
  flowPathsUnique,
}: {
  flowPathsUnique: string[]
}): ReplacementOutputType => {
  const imports = flowPathsUnique.map(
    (str) => `import ${path.basename(str)} from "${str}"`
  )

  return [
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
        [outTypeImport(), `import ${p1} from "${p2}"`].join(
          "\n"
        ),
      search: regex,
      condition: (body) => !body.match(/\sOutType\s/),
    },
  ]
}
