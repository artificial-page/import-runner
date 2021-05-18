import { basename, dirname, join } from "path"
import { ESLint } from "eslint"
import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"
import importRunnerImport from "./parsers/importRunnerImport"
import importRunnerFlow, {
  FlowType,
} from "./parsers/importRunnerFlow"
import defaultFunctionReplacer from "./replacers/defaultFunction"
import defaultFunction from "./parsers/defaultFunction"
import typeKeys from "./parsers/typeKeys"
import emptyDefaultFunction from "./coders/emptyDefaultFunction"
import functionInputTypes from "./coders/functionInputTypes"
import relativeImports from "./coders/relativeImports"
import outTypeImport from "./coders/outTypeImport"
import emptyRunnerFunction from "./coders/emptyRunnerFunction"
import topImports from "./replacers/topImports"

export interface FlowPath {
  importPath: string
  importPathBase: string
  outputTypeIds: string[]
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
  if (!path.match(/Runner\.tsx?$/)) {
    return
  }

  let data = (await fsExtra.readFile(path)).toString()

  if (data.trim() === "") {
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

    const { defaultFunctionInputType: runnerInputType } =
      defaultFunction({ data })

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

    if (prevImportPaths.length) {
      const imports = relativeImports({
        importPath: path,
        prevImportPaths,
      })

      promises.push(
        fileReplacer({
          fsExtra,
          data,
          dest: path,
          eslint,
          skipUnchanged: true,
          replacements: [
            ...defaultFunctionReplacer({ prevImportPaths }),
            ...topImports({
              imports: [
                'import { OutType } from "io-type"',
                ...imports,
              ],
            }),
          ],
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
  runnerInputType,
  eslint,
}: {
  flow: FlowType
  flowPaths: string[]
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
  path: string
  prevImportPaths: FlowPath[]
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
            runnerInputType,
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
  prevImportPaths: FlowPath[]
  promises: Promise<any>[]
  runnerInputType: string
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

    imports = []

    if (prevImportPaths.length) {
      inputTypes = functionInputTypes({
        prevImportPaths,
        runnerInputType,
      })

      imports = [
        outTypeImport(),
        ...imports,
        ...relativeImports({ importPath, prevImportPaths }),
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
    }
  }
}

export default sourceProcessor
