import { dirname, join } from "path"
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
import emptyDefaultFunction from "./coders/emptyDefaultFunction"
import functionInputTypes from "./coders/functionInputTypes"
import relativeImports from "./coders/relativeImports"
import outTypeImport from "./coders/outTypeImport"
import emptyRunnerFunction from "coders/emptyRunnerFunction"

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
    await fsExtra.writeFile(path, data)
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

    promises.push(
      fileReplacer({
        fsExtra,
        data,
        dest: path,
        eslint,
        skipUnchanged: true,
        replacements: [
          ...defaultFunctionReplacer({ flowPathsUnique }),
          ...importRunnerImportReplacer({
            flowPathsUnique,
          }),
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

  let importData: string

  if (await fsExtra.pathExists(importPath)) {
    importData = (
      await fsExtra.readFile(importPath)
    ).toString()
  } else {
    importData = emptyDefaultFunction()

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
      const inputTypePaths = prevImportPaths.filter(
        ([, t]) => !!t
      )

      inputTypes = functionInputTypes({
        inputTypePaths,
        runnerInputType,
      })

      imports = [
        outTypeImport(),
        ...imports,
        ...relativeImports({ importPath, inputTypePaths }),
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

export default sourceProcessor
