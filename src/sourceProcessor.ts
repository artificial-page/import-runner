import { basename, dirname, join, relative } from "path"
import { ESLint } from "eslint"
import fileReplacerType, {
  ReplacementOutputType,
} from "file-replacer"
import fsExtraType from "fs-extra"
import importRunnerImport from "./parsers/importRunnerImport"
import importRunnerFlow, {
  FlowType,
} from "./parsers/importRunnerFlow"
import importRunnerImportReplacer from "./replacers/importRunnerImport"
import defaultFunctionReplacer from "./replacers/defaultFunction"
import defaultFunction from "./parsers/defaultFunction"
import typeKeys from "./parsers/typeKeys"

export async function sourceProcessor({
  fileReplacer,
  fsExtra,
  path,
  eslint,
}: {
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
  path: string
  eslint?: ESLint
}): Promise<void> {
  const promises = []
  const data = (await fsExtra.readFile(path)).toString()

  const { importVarName } = importRunnerImport({
    data,
  })

  if (importVarName) {
    const { flowPathsUnique, flowPaths, flow } =
      importRunnerFlow({
        data,
        importVarName,
      })

    const { defaultFunctionInputType: runnerInputType } =
      defaultFunction({
        data,
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

    promises.push(
      fileReplacer({
        fsExtra,
        data,
        dest: path,
        eslint,
        skipUnchanged: true,
        replacements: [
          ...defaultFunctionReplacer({ outputTypes }),
          ...importRunnerImportReplacer({ imports }),
        ],
      })
    )

    const prevImportPaths = []

    await processFlow({
      eslint,
      fileReplacer,
      flow,
      flowPaths,
      fsExtra,
      path,
      prevImportPaths,
      promises,
      runnerInputType,
    })
  }

  await Promise.all(promises)
}

export async function processFlow({
  flow,
  flowPaths,
  fileReplacer,
  fsExtra,
  path,
  prevImportPaths,
  promises,
  runnerInputType,
  eslint,
}: {
  flow: FlowType
  flowPaths: string[]
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
  path: string
  prevImportPaths: [string, string[]][]
  promises: Promise<any>[]
  runnerInputType: string
  eslint?: ESLint
}): Promise<void> {
  for (const flowKey in flow) {
    if (flowKey === "all" || flowKey === "each") {
      const lockedPrevPaths = prevImportPaths.concat([])

      for (const flowPath of flow[flowKey]) {
        if (typeof flowPath === "string") {
          const nextFlowPath = flowPaths.shift()

          if (flowPath !== nextFlowPath) {
            throw new Error("flow path mismatch")
          }

          // Don't process paths that exist further down the flow
          if (flowPaths.includes(flowPath)) {
            continue
          }

          prevImportPaths.push(
            await processFlowPath({
              eslint,
              fileReplacer,
              flowPath,
              fsExtra,
              path,
              prevImportPaths:
                flowKey === "all"
                  ? lockedPrevPaths
                  : prevImportPaths,
              promises,
              runnerInputType,
            })
          )
        } else {
          await processFlow({
            eslint,
            flow: flowPath,
            flowPaths,
            fileReplacer,
            fsExtra,
            path,
            prevImportPaths,
            promises,
            runnerInputType,
          })
        }
      }
    }
  }
}

export async function processFlowPath({
  fileReplacer,
  flowPath,
  fsExtra,
  path,
  prevImportPaths,
  promises,
  runnerInputType,
  eslint,
}: {
  fileReplacer: typeof fileReplacerType
  flowPath: string
  fsExtra: typeof fsExtraType
  path: string
  prevImportPaths: [string, string[]][]
  promises: Promise<any>[]
  runnerInputType: string
  eslint?: ESLint
}): Promise<[string, string[]]> {
  const importPath = join(dirname(path), flowPath + ".ts")

  let importData = /* typescript */ `
    export default async (input: unknown): Promise<any> => {
      return {}
    }
  `.replace(/\n\s{4}/g, "\n")

  if (await fsExtra.pathExists(importPath)) {
    importData = (
      await fsExtra.readFile(importPath)
    ).toString()
  } else {
    await fsExtra.ensureFile(importPath)
    await fsExtra.writeFile(importPath, importData)
  }

  const {
    defaultFunctionMatch,
    defaultFunctionOutputType,
  } = defaultFunction({
    data: importData,
  })

  let outputTypeIds = []

  if (defaultFunctionOutputType) {
    outputTypeIds = typeKeys({
      types: defaultFunctionOutputType,
    })

    let imports: string[]
    let inputTypes: string

    imports = []

    if (prevImportPaths.length) {
      imports.unshift('import { OutType } from "io-type"')

      inputTypes = `(\n  input: ${runnerInputType.replace(
        /\n/g,
        "\n  "
      )} & ${prevImportPaths
        .map(([p, t], i) =>
          t
            ? `OutType<typeof ${basename(p, ".ts")}>${
                prevImportPaths.length - 1 === i ? "" : " &"
              } // ${t.join(", ")}`
            : undefined
        )
        .filter((str) => str)
        .join("\n    ")}\n)`

      imports = [
        ...imports,
        ...prevImportPaths
          .map(([p]) => {
            const relImportPath = relPath({
              fromPath: importPath,
              toPath: p,
            })

            return `import ${basename(
              p,
              ".ts"
            )} from "${relImportPath}"`
          })
          .filter((str) => str),
      ]
    } else {
      inputTypes = `(input: ${runnerInputType})`
    }

    promises.push(
      fileReplacer({
        fsExtra,
        data: importData,
        dest: importPath,
        eslint,
        skipUnchanged: true,
        replacements: [
          {
            search:
              defaultFunctionMatch[1] +
              defaultFunctionMatch[2] +
              defaultFunctionMatch[3],
            replace:
              defaultFunctionMatch[1] +
              defaultFunctionMatch[2] +
              inputTypes,
          },
          ...imports
            .reverse()
            .map((str): ReplacementOutputType[0] => {
              return {
                replace: str + "\n",
                search: /^/,
                condition: (body) => !body.includes(str),
              }
            }),
        ],
      })
    )
  }

  return [importPath, outputTypeIds]
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
