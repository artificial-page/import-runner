import { ESLint } from "eslint"
import { basename, dirname, join } from "path"
import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"
import emptyRunnerFunction from "./coders/emptyRunnerFunction"
import relPath from "./helpers/relPath"
import defaultFunction from "./parsers/defaultFunction"
import { regex as defaultFunctionRegex } from "./parsers/defaultFunction"
import importRunnerFlow from "./parsers/importRunnerFlow"
import { FlowType } from "./parsers/importRunnerFlow"
import importRunnerImport from "./parsers/importRunnerImport"
import { OutType } from "io-type"
import topImports from "./replacers/topImports"
import childPath from "./helpers/childPath"

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

export default async (input: {
  eslint: ESLint
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
  path: string
  srcRootPath: string
  pathCache?: Record<string, string[]>
  readme?: boolean
}): Promise<void> => {
  const {
    fileReplacer,
    fsExtra,
    path,
    eslint,
    srcRootPath,
  } = input

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

  const { flow } = importRunnerFlow({ data, importVarName })

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

  const flowInputTypes = flowDataTypes({
    flowData,
    style: "RawInType",
  })

  const flowOutputTypes = flowDataTypes({
    flowData,
    style: "RawInOutType",
  })

  promises.push(
    fileReplacer({
      fsExtra,
      data,
      dest: path,
      eslint,
      skipUnchanged: true,
      replacements: [
        {
          search: defaultFunctionRegex,
          replace: (m, p1, p2, p3, p4) => {
            const x = `${p1}${p2}${`(${functionData.defaultFunctionInputName}: ${flowInputTypes}): `}${
              p4.match(/Promise</) ? "Promise<" : ""
            }${flowOutputTypes}${
              p4.match(/Promise</) ? ">" : ""
            }`
            return x
          },
        },
      ],
    })
  )

  await Promise.all(promises)
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

          const data = (
            await fsExtra.readFile(importPath)
          ).toString()

          const functionData = defaultFunction({ data })

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

            const pathBasename = basename(path).replace(
              /\.tsx?/,
              ""
            )
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

            const inputTypes = `(input: ${defaultFunctionInputType} & InType<typeof ${pathBasename}>${
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
                    search:
                      defaultFunctionMatch[1] +
                      defaultFunctionMatch[2] +
                      defaultFunctionMatch[3],
                    replace:
                      defaultFunctionMatch[1] +
                      defaultFunctionMatch[2] +
                      inputTypes,
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

      if (key === "all") {
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

          const {
            defaultFunctionInputType,
            defaultFunctionOutputType,
          } = data.functionData

          let typeStr: string

          if (
            style === "RawInType" &&
            defaultFunctionInputType
          ) {
            typeStr = defaultFunctionInputType
          } else if (
            style === "RawOutType" &&
            defaultFunctionOutputType
          ) {
            typeStr = defaultFunctionOutputType
          } else if (
            style === "RawInOutType" &&
            defaultFunctionInputType &&
            defaultFunctionOutputType
          ) {
            typeStr = `(${defaultFunctionInputType} & ${defaultFunctionOutputType})`
          } else if (style === "InType" && base) {
            typeStr = `InType<typeof ${base}>`
          } else if (style === "OutType" && base) {
            typeStr = `OutType<typeof ${base}>`
          }

          if (typeStr) {
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
        output.push(
          tmpOutput.join(key === "route" ? " | " : " & ")
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
