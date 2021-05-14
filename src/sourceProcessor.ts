import { basename, dirname, join, relative } from "path"
import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"
import importRunnerImport from "./parsers/importRunnerImport"
import importRunnerFlow from "./parsers/importRunnerFlow"
import importRunnerImportReplacer from "./replacers/importRunnerImport"
import defaultOutputTypeReplacer from "./replacers/defaultOutputType"
import defaultOutputType from "./parsers/defaultOutputType"
import typeKeys from "./parsers/typeKeys"

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
    const { flowPathsUnique } = importRunnerFlow({
      data,
      importVarName,
    })

    const imports = flowPathsUnique.map(
      (str) => `import ${basename(str)} from "${str}"`
    )

    const basenames = flowPathsUnique.map((str) =>
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
        ...defaultOutputTypeReplacer({ outputTypes }),
        ...importRunnerImportReplacer({ imports }),
      ],
    })

    const prevImportPaths = []

    for (const flowPath of flowPathsUnique) {
      await processFlowPath({
        fileReplacer,
        flowPath,
        fsExtra,
        path,
        prevImportPaths,
      })
    }
  }
}

export async function processFlowPath({
  fileReplacer,
  flowPath,
  fsExtra,
  path,
  prevImportPaths,
}: {
  fileReplacer: typeof fileReplacerType
  flowPath: string
  fsExtra: typeof fsExtraType
  path: string
  prevImportPaths: [string, string[]][]
}): Promise<void> {
  const importPath = join(dirname(path), flowPath + ".ts")

  const importData = (
    await fsExtra.readFile(importPath)
  ).toString()

  const { outputTypeMatch, outputType } = defaultOutputType(
    { data: importData }
  )

  let outputTypeIds = []

  if (outputType) {
    outputTypeIds = typeKeys({ types: outputType })

    const pathInType = `InType<typeof ${basename(
      path,
      ".ts"
    )}>`

    const relImportPath = relPath({
      fromPath: importPath,
      toPath: path,
    })

    let imports: string[]
    let inputTypes: string

    imports = [
      `import ${basename(
        path,
        ".ts"
      )} from "${relImportPath}"`,
    ]

    if (prevImportPaths.length) {
      imports.unshift(
        'import { InType, OutType } from "io-type"'
      )

      inputTypes = `(\n  input: ${pathInType} &\n    ${prevImportPaths
        .map(
          ([p, t], i) =>
            `OutType<typeof ${basename(p, ".ts")}>${
              prevImportPaths.length - 1 === i ? "" : " &"
            } // ${t.join(", ")}`
        )
        .join("\n    ")}\n)`

      imports = [
        ...imports,
        ...prevImportPaths
          .map(([p]) => {
            const relImportPath = relPath({
              fromPath: importPath,
              toPath: p,
            })

            if (
              !importData.includes(
                `import ${basename(p, ".ts")} `
              )
            ) {
              return `import ${basename(
                p,
                ".ts"
              )} from "${relImportPath}"`
            }
          })
          .filter((str) => str),
      ]
    } else {
      imports.unshift('import { InType } from "io-type"')
      inputTypes = `(\n  input: ${pathInType}\n)`
    }

    await fileReplacer({
      fsExtra,
      data: importData,
      dest: importPath,
      replacements: [
        {
          search:
            outputTypeMatch[1] +
            outputTypeMatch[2] +
            outputTypeMatch[3],
          replace:
            outputTypeMatch[1] +
            outputTypeMatch[2] +
            inputTypes,
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

export function relPath({
  fromPath,
  toPath,
}: {
  fromPath: string
  toPath: string
}): string {
  let rel = relative(dirname(fromPath), toPath).replace(
    /\.ts$/,
    ""
  )

  if (!rel.startsWith(".")) {
    rel = "./" + rel
  }

  return rel
}

export default sourceProcessor
