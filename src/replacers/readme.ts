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

  const { toc, content } = processFlow({
    fileReplacer,
    flowData,
    fsExtra,
    breadcrumbs: "",
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
        replace: `<!-- BEGIN BODY -->\n${
          toc + content
        }\n<!-- END BODY -->`,
      },
    ],
  })
}

export function processFlow({
  path,
  fileReplacer,
  flowData,
  fsExtra,
  breadcrumbs,
  indent,
  srcRootPath,
}: {
  path: string
  fileReplacer: typeof fileReplacerType
  flowData: FlowDataType
  fsExtra: typeof fsExtraType
  breadcrumbs: string
  indent: string
  srcRootPath: string
}): { toc: string; content: string } {
  const pathDirname = dirname(path)

  let toc = ""
  let content = ""

  for (const key in flowData) {
    if (
      instructions.includes(key) &&
      Array.isArray(flowData[key])
    ) {
      const flows = flowData[key]

      toc += `${indent}* ${key}\n`

      indent += "  "

      breadcrumbs += `${
        breadcrumbs.length > 0 ? " > " : ""
      }${key}`

      for (const flow of flows) {
        const { importPath } = flow

        if (importPath) {
          const { functionData } = flow
          const {
            defaultFunctionDescription: desc,
            defaultFunctionInputType: inputType,
            defaultFunctionOutputType: outputType,
          } = functionData

          const relPath = relative(pathDirname, srcRootPath)
          const srcPath = relative(srcRootPath, importPath)
          const relSrcPath = join(relPath, srcPath)
          const simplePath = srcPath.replace(/\.tsx?$/, "")
          const tocAnchor = `${breadcrumbs} > ${simplePath}`
            .toLowerCase()
            .replace(/\s/g, "-")
            .replace(/[^a-z\-]/g, "")
          const tocLink = `[${simplePath}](#${tocAnchor})`
          const contentLink = `[${simplePath}](${relSrcPath})`

          toc += `${indent}* ${tocLink}${
            desc ? ` — ${desc}` : ""
          }\n`

          content += `
## ${breadcrumbs} > ${contentLink}
${desc ? `\n${desc}\n` : ""}
${
  inputType
    ? `### Input

\`\`\`ts
${inputType}
\`\`\`
`
    : ""
}
${
  outputType
    ? `### Output

\`\`\`ts
${outputType}
\`\`\`
`
    : ""
}`
        } else {
          const { toc: t, content: c } = processFlow({
            fileReplacer,
            flowData: flow,
            fsExtra,
            breadcrumbs,
            indent,
            path,
            srcRootPath,
          })
          toc += t
          content += c
        }
      }
    }
  }

  return { toc, content }
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
