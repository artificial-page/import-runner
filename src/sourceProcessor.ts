import { basename } from "path"
import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"

export const runnerImportRegex =
  /import ([^\s]+) from "(\.?\/?importRunner)"/

export const fnRegexString = "\\({(.+)(?=\\n\\s\\s})"

export const dynamicImportRegex = /import\(\s*["'][^"']+/g

export const outputTypeRegexString =
  "}\\):\\s(Promise<Record<string,\\sany>>|Promise<any>|any)\\s{"

export async function sourceProcessor({
  path,
  fileReplacer,
  fsExtra,
}: {
  path: string
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
}): Promise<void> {
  const data = (await fsExtra.readFile(path)).toString()
  const match = data.match(runnerImportRegex)

  if (match && match[1]) {
    const fnMatch = data.match(
      new RegExp(match[1] + fnRegexString, "s")
    )
    if (fnMatch && fnMatch[1]) {
      const importPaths = fnMatch[1]
        .match(dynamicImportRegex)
        .map((str) => str.split(/["']/)[1])
        .filter(
          (value, index, self) =>
            self.indexOf(value) === index
        )

      const imports = importPaths.map(
        (str) => `import ${basename(str)} from "${str}"`
      )

      const basenames = importPaths.map((str) =>
        basename(str)
      )

      const outputTypes = basenames
        .map((str) => `OutType<typeof ${str}>`)
        .join(" &\n  ")

      await fileReplacer({
        fsExtra,
        data,
        dest: path,
        replacements: [
          {
            replace: (m, p1, p2) =>
              `}): ${outputTypes} {${p2}`,
            search: new RegExp(
              `${outputTypeRegexString}(.+)(?=${match[1]}\\({)`,
              "s"
            ),
          },
          {
            replace: (m, p1, p2) =>
              [
                `import ${p1} from "${p2}"`,
                ...imports,
              ].join("\n"),
            search: runnerImportRegex,
          },
          {
            replace: (m, p1, p2) =>
              [
                'import { OutType } from "io-type"',
                `import ${p1} from "${p2}"`,
              ].join("\n"),
            search: runnerImportRegex,
            condition: (body) => !body.match(/\sOutType\s/),
          },
        ],
      })
    }
  }
}

export default sourceProcessor
