import { basename, dirname, join } from "path"
import { ESLint } from "eslint"
import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"
import importRunnerImport, {
  regex as importRunnerImportRegex,
} from "./parsers/importRunnerImport"
import importRunnerFlow, {
  FlowType,
} from "./parsers/importRunnerFlow"
import defaultFunctionReplacer from "./replacers/defaultFunction"
import defaultFunction from "./parsers/defaultFunction"
import typeKeys from "./parsers/typeKeys"
import emptyDefaultFunction from "./coders/emptyDefaultFunction"
import functionInputTypes from "./coders/functionInputTypes"
import relativeImports from "./coders/relativeImports"
import emptyRunnerFunction from "./coders/emptyRunnerFunction"
import topImports from "./replacers/topImports"
import relPath from "./helpers/relPath"

export interface FlowPath {
  importPath: string
  importPathBase: string
  outputTypeIds: string[]
  inputTypes: string
  outputTypes: string
}

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
  let data = (await fsExtra.readFile(path)).toString()

  if (
    data.match(importRunnerImportRegex) &&
    data.replace(importRunnerImportRegex, "").trim() === ""
  ) {
    data = emptyRunnerFunction()
    await fileReplacer({
      data,
      dest: path,
      eslint,
      fsExtra,
    })
  }

  const promises = []
  const { importVarName } = importRunnerImport({ data })

  if (importVarName) {
    const { flowPathsUnique, flowPaths, flow } =
      importRunnerFlow({
        data,
        importVarName,
      })

    if (!flowPathsUnique) {
      return
    }

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
    })

    if (prevImportPaths.length) {
      promises.push(
        fileReplacer({
          fsExtra,
          data,
          dest: path,
          eslint,
          skipUnchanged: true,
          replacements: defaultFunctionReplacer({
            prevImportPaths,
          }),
        })
      )
    }
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
  eslint,
}: {
  flow: FlowType
  flowPaths: string[]
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
  path: string
  prevImportPaths: FlowPath[]
  promises: Promise<any>[]
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

          const prevImportPath = await processFlowPath({
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
          })

          if (prevImportPath) {
            prevImportPaths.push(prevImportPath)
          }
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
  eslint,
}: {
  fileReplacer: typeof fileReplacerType
  flowPath: string
  fsExtra: typeof fsExtraType
  path: string
  prevImportPaths: FlowPath[]
  promises: Promise<any>[]
  eslint?: ESLint
}): Promise<FlowPath> {
  const importPath = join(dirname(path), flowPath + ".ts")

  let importData: string

  if (await fsExtra.pathExists(importPath)) {
    importData = (
      await fsExtra.readFile(importPath)
    ).toString()
  } else {
    importData = emptyDefaultFunction()

    await fileReplacer({
      data: importData,
      dest: importPath,
      eslint,
      fsExtra,
    })
  }

  const {
    defaultFunctionMatch,
    defaultFunctionInputType,
    defaultFunctionOutputType,
  } = defaultFunction({
    data: importData,
  })

  let outputTypeIds: string[]

  if (defaultFunctionOutputType) {
    outputTypeIds = typeKeys({
      types: defaultFunctionOutputType,
    })

    let imports: string[]
    let inputTypes: string

    const relImportPath = relPath({
      fromPath: importPath,
      toPath: path,
    })

    const pathBasename = basename(path, ".ts")

    imports = [
      `import ${pathBasename} from "${relImportPath}"`,
    ]

    if (prevImportPaths.length) {
      inputTypes = functionInputTypes({
        defaultFunctionInputType,
        pathBasename,
        prevImportPaths,
      })

      imports = [
        ...imports,
        'import { InType, OutType } from "io-type"',
        ...imports,
        ...relativeImports({ importPath, prevImportPaths }),
      ]
    } else {
      imports = [
        ...imports,
        'import { InType } from "io-type"',
      ]
      const input =
        !defaultFunctionInputType ||
        defaultFunctionInputType === "Record<string, never>"
          ? ""
          : `${defaultFunctionInputType} & `

      inputTypes = `(\n  input: ${input}InType<typeof ${pathBasename}>\n)`
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
          ...topImports({ imports }),
        ],
      })
    )
  }

  if (outputTypeIds) {
    return {
      importPath,
      importPathBase: basename(importPath).replace(
        /\.tsx?$/,
        ""
      ),
      outputTypeIds,
      inputTypes: defaultFunctionInputType,
      outputTypes: defaultFunctionOutputType,
    }
  }
}

export default sourceProcessor
