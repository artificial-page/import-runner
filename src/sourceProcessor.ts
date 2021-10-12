import { ESLint } from "eslint"
import { basename, dirname, join } from "path"
import prettierType from "prettier"
import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"
import emptyRunnerFunction from "./coders/emptyRunnerFunction"
import relPath from "./helpers/relPath"
import defaultFunction from "./parsers/defaultFunction"
import importRunnerFlow from "./parsers/importRunnerFlow"
import { FlowType } from "./parsers/importRunnerFlow"
import importRunnerImport from "./parsers/importRunnerImport"
import { OutType } from "io-type"
import topImports from "./replacers/topImports"
import childPath from "./helpers/childPath"
import readme from "./replacers/readme"
import emptyDefaultFunction from "./coders/emptyDefaultFunction"

export const instructions = ["all", "each", "route"]

export interface FlowDataChildType {
  importPath: string
  functionData: OutType<typeof defaultFunction>
}

export interface FlowDataType {
  all?: (FlowDataType | FlowDataChildType)[]
  each?: (FlowDataType | FlowDataChildType)[]
  route?: (FlowDataType | FlowDataChildType)[]
}

export default async function sourceProcessor(input: {
  eslint: ESLint
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
  prettier: typeof prettierType
  path: string
  srcRootPath: string
  pathCache?: Record<string, string[]>
  readme?: boolean
}): Promise<void> {
  const {
    fileReplacer,
    fsExtra,
    prettier,
    path,
    eslint,
    srcRootPath,
    pathCache,
  } = input

  if (pathCache && pathCache[path]) {
    await Promise.all(
      pathCache[path].map((p) =>
        sourceProcessor({
          ...input,
          path: p,
        })
      )
    )
  }

  let data = (await fsExtra.readFile(path)).toString()

  const { importVarName, importStr } = importRunnerImport({
    data,
  })

  if (!importVarName) {
    return
  }

  const isEmpty = data.replace(importStr, "").trim() === ""

  if (isEmpty) {
    data = await fileReplacer({
      data: emptyRunnerFunction(),
      dest: path,
      eslint,
      fsExtra,
    })
  }

  const { flow, flowPathsUnique } = importRunnerFlow({
    data,
    importVarName,
  })

  if (pathCache) {
    const pathDirname = dirname(path)

    for (let p of flowPathsUnique) {
      p = join(pathDirname, p + ".ts")
      pathCache[p] = pathCache[p] || []

      if (!pathCache[p].includes(path)) {
        pathCache[p].push(path)
      }
    }
  }

  const flowData = {}
  const promises = []

  await processFlow({
    eslint,
    fileReplacer,
    flow,
    flowData,
    flowSubData: flowData,
    fsExtra,
    path,
    promises,
    srcRootPath,
  })

  const functionData = defaultFunction({ data })

  const flowInputTypes =
    flowDataTypes({
      flowData,
      style: "RawInType",
    }) || "Record<string, never>"

  const flowOutputTypes =
    flowDataTypes({
      flowData,
      style: "RawOutType",
    }) || "Record<string, never>"

  const promiseOutput =
    functionData.defaultFunctionMatch[2].match(/Promise</)

  promises.push(
    fileReplacer({
      fsExtra,
      data,
      dest: path,
      eslint,
      skipUnchanged: true,
      replacements: [
        {
          search: functionData.defaultFunctionMatch[1],
          replace: `(${functionData.defaultFunctionInputName}: ${flowInputTypes}`,
        },
        {
          search: functionData.defaultFunctionMatch[2],
          replace: `): ${
            promiseOutput ? "Promise<" : ""
          }${flowOutputTypes}${promiseOutput ? ">" : ""}`,
        },
      ],
    })
  )

  await Promise.all(promises)

  data = (await fsExtra.readFile(path)).toString()
  const {
    defaultFunctionRawInputType,
    defaultFunctionRawOutputType,
  } = defaultFunction({ data })

  const { readmeData, readmePath } = await readme({
    fileReplacer,
    flowData,
    fsExtra,
    path,
    pathDescription:
      functionData.defaultFunctionDescription,
    pathInput: defaultFunctionRawInputType,
    pathOutput: defaultFunctionRawOutputType,
    srcRootPath,
  })

  const options = await prettier.resolveConfig(readmePath)
  const formatted = prettier.format(readmeData, {
    ...options,
    filepath: readmePath,
  })

  await fileReplacer({
    data: formatted,
    dest: readmePath,
    fsExtra,
  })
}

export async function processFlow({
  eslint,
  fileReplacer,
  fsExtra,
  path,
  srcRootPath,
  flow,
  flowData,
  flowSubData,
  promises,
}: {
  eslint: ESLint
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
  path: string
  srcRootPath: string
  flow: FlowType
  flowData: FlowDataType
  flowSubData: FlowDataType
  promises: Promise<any>[]
}): Promise<void> {
  for (const key in flow) {
    if (
      instructions.includes(key) &&
      Array.isArray(flow[key])
    ) {
      const tmpData = []

      flowSubData[key] = []

      for (let importPath of flow[key]) {
        if (typeof importPath === "string") {
          importPath = join(
            dirname(path),
            `${importPath}.ts`
          )

          let data: string

          if (await fsExtra.pathExists(importPath)) {
            data = (
              await fsExtra.readFile(importPath)
            ).toString()
          } else {
            data = await fileReplacer({
              data: emptyDefaultFunction(),
              dest: importPath,
              eslint,
              fsExtra,
            })
          }

          const pathBasename = basename(path).replace(
            /\.tsx?/,
            ""
          )

          const functionData = defaultFunction({
            data,
            pathBasename,
          })

          if (
            childPath({
              fromPath: path,
              toPath: importPath,
            })
          ) {
            const {
              defaultFunctionMatch,
              defaultFunctionInputType,
            } = functionData

            const relRunnerPath = relPath({
              fromPath: importPath,
              toPath: path,
            })

            const runnerImport = `import ${pathBasename} from "${relRunnerPath}"`

            const imports = [
              runnerImport,
              ...flowDataImports({ flowData, importPath }),
            ]

            const flowInputTypes = flowDataTypes({
              flowData,
              style: "OutType",
            })

            imports.unshift(
              'import { InType } from "io-type"'
            )

            if (flowInputTypes?.includes("OutType<")) {
              imports.unshift(
                'import { OutType } from "io-type"'
              )
            }

            const inputTypes = `(input: ${
              defaultFunctionInputType &&
              defaultFunctionInputType !== "void"
                ? `${defaultFunctionInputType} & `
                : ""
            }InType<typeof ${pathBasename}>${
              flowInputTypes ? ` & ${flowInputTypes}` : ""
            }`

            promises.push(
              fileReplacer({
                fsExtra,
                data,
                dest: importPath,
                eslint,
                skipUnchanged: true,
                replacements: [
                  {
                    search: defaultFunctionMatch[1],
                    replace: inputTypes,
                  },
                  ...topImports({
                    imports,
                    data,
                  }),
                ],
              })
            )
          }

          if (key === "each") {
            flowSubData[key].push({
              importPath,
              functionData,
            })
          } else {
            tmpData.push({ importPath, functionData })
          }
        } else {
          const newFlowData = {}
          flowSubData[key].push(newFlowData)

          await processFlow({
            eslint,
            fileReplacer,
            path,
            srcRootPath,
            flow: importPath,
            flowData,
            flowSubData: newFlowData,
            fsExtra,
            promises,
          })
        }
      }

      if (key === "all" || key === "route") {
        for (const obj of tmpData) {
          flowSubData[key].push(obj)
        }
      }
    }
  }
}

export function flowDataTypes({
  flowData,
  style,
}: {
  flowData: FlowDataType
  style:
    | "RawInType"
    | "RawOutType"
    | "RawInOutType"
    | "InType"
    | "OutType"
}): string {
  const output: string[] = []
  const lines: string[] = []

  for (const key in flowData) {
    if (
      instructions.includes(key) &&
      Array.isArray(flowData[key])
    ) {
      const tmpOutput: string[] = []

      for (const data of flowData[key]) {
        if (data.importPath) {
          const base = basename(data.importPath).replace(
            /\.tsx?/,
            ""
          )

          let {
            defaultFunctionInputType: inputType,
            defaultFunctionOutputType: outputType,
          } = data.functionData

          inputType = inputType.match(/\s[|&]\s/)
            ? `(${inputType})`
            : inputType

          outputType = outputType.match(/\s[|&]\s/)
            ? `(${outputType})`
            : outputType

          let typeStr: string

          if (style === "RawInType" && inputType) {
            typeStr = inputType
          } else if (style === "RawOutType" && outputType) {
            typeStr = outputType
          } else if (
            style === "RawInOutType" &&
            (inputType || outputType)
          ) {
            const types = [inputType, outputType].filter(
              (t, index, self) =>
                t &&
                (t !== "void" || self.indexOf(t) === index)
            )

            if (types.length) {
              typeStr = types.join(" & ")
            }

            if (types.length > 1) {
              typeStr = `(${typeStr})`
            }
          } else if (style === "InType" && base) {
            typeStr = `InType<typeof ${base}>`
          } else if (style === "OutType" && base) {
            typeStr = `OutType<typeof ${base}>`
          }

          if (typeStr && typeStr !== "void") {
            tmpOutput.push(typeStr)
          }
        } else {
          const types = flowDataTypes({
            flowData: data,
            style,
          })
          if (types) {
            tmpOutput.push(types)
          }
        }
      }

      if (tmpOutput.length) {
        const or = key === "route" && style !== "RawOutType"

        output.push(
          tmpOutput
            .filter((value, index, self) => {
              if (or) {
                return true
              }

              const match = value.match(/^\s+([^&|]+)$/)

              if (match) {
                if (lines.includes(match[1])) {
                  return false
                } else {
                  lines.push(match[1])
                  return true
                }
              }

              return self.indexOf(value) === index
            })
            .join(or ? " | " : " & ")
        )
      }
    }

    if (output.length) {
      return output.map((o) => `(${o})`).join(" & ")
    }
  }
}

export function flowDataImports({
  flowData,
  importPath,
}: {
  flowData: FlowDataType
  importPath: string
}): string[] {
  const imports: string[] = []

  for (const key in flowData) {
    if (
      instructions.includes(key) &&
      Array.isArray(flowData[key])
    ) {
      for (const data of flowData[key]) {
        if (data.importPath) {
          const base = basename(data.importPath).replace(
            /\.tsx?/,
            ""
          )

          const path = relPath({
            fromPath: importPath,
            toPath: data.importPath,
          })

          imports.push(`import ${base} from "${path}"`)
        } else {
          const imps = flowDataImports({
            flowData: data,
            importPath,
          })
          for (const imp of imps) {
            imports.push(imp)
          }
        }
      }
    }
  }

  return imports.filter((imp) => imports.includes(imp))
}
