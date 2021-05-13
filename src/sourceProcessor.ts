import { basename, dirname, join, relative } from "path"
import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"
import importRunnerImport from "./parsers/importRunnerImport"

export const runnerImportRegex =
  /import ([^\s]+) from "(\.?\/?importRunner)"/

export const fnRegexString = "\\({(.+)(?=\\n\\s\\s})"

export const dynamicImportRegex = /import\(\s*["'][^"']+/g

export const outputTypeRegexString =
  "}\\):\\s(Promise<Record<string,\\sany>>|Promise<any>|any)\\s{"

export const defaultFunctionOutputTypeRegex =
  /export default (.+)(?=(\([^)]*\)):\s(Promise<)?(\{.+})>\s(=>|{))/s

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

  const { importVarName } = importRunnerImport({
    data,
  })

  if (importVarName) {
    const fnMatch = data.match(
      new RegExp(importVarName + fnRegexString, "s")
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
        .join(" &\n    ")

      await fileReplacer({
        fsExtra,
        data,
        dest: path,
        replacements: [
          {
            replace: (m, p1, p2) =>
              `}): Promise<\n  ${outputTypes}\n> {${p2}`,
            search: new RegExp(
              `${outputTypeRegexString}(.+)(?=${importVarName}\\({)`,
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

      const prevImportPaths = []

      for (const importName of importPaths) {
        const importPath = join(
          dirname(path),
          importName + ".ts"
        )

        const importData = (
          await fsExtra.readFile(importPath)
        ).toString()

        const outputTypesMatch =
          importData.match(
            defaultFunctionOutputTypeRegex
          ) || []

        let outputTypeIds = []

        if (outputTypesMatch[4]) {
          const outputTypes = outputTypesMatch[4]
          const outputTypeIdsMatch =
            outputTypes.match(/\w+\??:/g)

          if (outputTypeIdsMatch) {
            outputTypeIds = outputTypeIdsMatch.map(
              (str) => str.split(/\??:/)[0]
            )
          }
        }

        if (outputTypesMatch[0] && outputTypesMatch[2]) {
          let imports: string[]
          let inputTypes: string

          const pathInType = `InType<typeof ${basename(
            path,
            ".ts"
          )}>`

          let relPath = relative(
            dirname(importPath),
            path
          ).replace(/\.ts$/, "")

          if (!relPath.startsWith(".")) {
            relPath = "./" + relPath
          }

          imports = [
            `import ${basename(
              path,
              ".ts"
            )} from "${relPath}"`,
          ]

          if (prevImportPaths.length) {
            imports.unshift(
              'import { InType, OutType } from "io-type"'
            )
            inputTypes = `(\n  input: ${pathInType} &\n    ${prevImportPaths
              .map(
                ([p, t], i) =>
                  `OutType<typeof ${basename(p, ".ts")}>${
                    prevImportPaths.length - 1 === i
                      ? ""
                      : " &"
                  } // ${t.join(", ")}`
              )
              .join("\n    ")}\n)`

            imports = [
              ...imports,
              ...prevImportPaths
                .map(([p]) => {
                  let relPath = relative(
                    dirname(importPath),
                    p
                  ).replace(/\.ts$/, "")

                  if (!relPath.startsWith(".")) {
                    relPath = "./" + relPath
                  }

                  if (
                    !importData.includes(
                      `import ${basename(p, ".ts")} `
                    )
                  ) {
                    return `import ${basename(
                      p,
                      ".ts"
                    )} from "${relPath}"`
                  }
                })
                .filter((str) => str),
            ]
          } else {
            imports.unshift(
              'import { InType } from "io-type"'
            )
            inputTypes = `(\n  input: ${pathInType}\n)`
          }

          await fileReplacer({
            fsExtra,
            data: importData,
            dest: importPath,
            replacements: [
              {
                search:
                  outputTypesMatch[0] + outputTypesMatch[2],
                replace: outputTypesMatch[0] + inputTypes,
              },
              {
                search: /^/,
                replace: imports.join("\n") + "\n\n",
              },
            ],
          })
        }

        prevImportPaths.push([importPath, outputTypeIds])
      }
    }
  }
}

export default sourceProcessor
