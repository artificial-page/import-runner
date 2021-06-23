import { basename, dirname, join, relative } from "path"
import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"
import {
  FlowDataType,
  instructions,
} from "../sourceProcessor"
import emptyReadme from "../coders/emptyReadme"

export default async ({
  path,
  pathDescription,
  fileReplacer,
  flowData,
  fsExtra,
  srcRootPath,
}: {
  path: string
  pathDescription: string
  fileReplacer: typeof fileReplacerType
  flowData: FlowDataType
  fsExtra: typeof fsExtraType
  srcRootPath: string
}): Promise<void> => {
  const pathBasename = basename(path, ".ts")
  const readMePath = join(dirname(path), "README.md")

  const body = processFlow({
    fileReplacer,
    flowData,
    fsExtra,
    indent: "",
    path,
    srcRootPath,
  })

  await fileReplacer({
    fsExtra,
    data: emptyReadme({ pathBasename }),
    dest: readMePath,
    createOnly: true,
  })

  await fileReplacer({
    fsExtra,
    src: readMePath,
    dest: readMePath,
    replacements: [
      {
        search:
          /<!-- BEGIN DESC -->\n(.*)<!-- END DESC -->/gms,
        replace: `<!-- BEGIN DESC -->\n${
          pathDescription || ""
        }\n<!-- END DESC -->`,
      },
      {
        search:
          /<!-- BEGIN BODY -->\n(.*)<!-- END BODY -->/gms,
        replace: `<!-- BEGIN BODY -->\n${body}\n<!-- END BODY -->`,
      },
    ],
  })
}

export function processFlow({
  path,
  fileReplacer,
  flowData,
  fsExtra,
  indent,
  srcRootPath,
}: {
  path: string
  fileReplacer: typeof fileReplacerType
  flowData: FlowDataType
  fsExtra: typeof fsExtraType
  indent: string
  srcRootPath: string
}): string {
  const pathDirname = dirname(path)
  let str = ""

  for (const key in flowData) {
    if (
      instructions.includes(key) &&
      Array.isArray(flowData[key])
    ) {
      const flows = flowData[key]

      str += `${indent}* ${key}\n`
      indent += "  "

      for (const flow of flows) {
        const { importPath } = flow

        if (importPath) {
          const { functionData } = flow
          const { defaultFunctionDescription: desc } =
            functionData

          str += `${indent}* ${pathLink({
            path: importPath,
            pathDirname,
            srcRootPath,
          })}${desc ? ` — ${desc}` : ""}\n`
        } else {
          str += processFlow({
            fileReplacer,
            flowData: flow,
            fsExtra,
            indent,
            path,
            srcRootPath,
          })
        }
      }
    }
  }

  return str
}

export function pathLink({
  path,
  pathDirname,
  srcRootPath,
}: {
  path: string
  pathDirname: string
  srcRootPath: string
}): string {
  const srcRelPath = relative(srcRootPath, path).replace(
    /\.tsx?$/,
    ""
  )
  const relPath = relative(pathDirname, path)
  return `[${srcRelPath}](${relPath})`
}
