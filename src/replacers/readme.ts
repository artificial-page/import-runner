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
  pathInput,
  pathOutput,
  fileReplacer,
  flowData,
  fsExtra,
  srcRootPath,
}: {
  path: string
  pathDescription: string
  pathInput: string
  pathOutput: string
  fileReplacer: typeof fileReplacerType
  flowData: FlowDataType
  fsExtra: typeof fsExtraType
  srcRootPath: string
}): Promise<{ readmeData: string; readmePath: string }> => {
  const pathBasename = basename(path, ".ts")
  const readmePath = join(dirname(path), "README.md")

  const { toc, content } = processFlow({
    fileReplacer,
    flowData,
    fsExtra,
    breadcrumbs: "",
    indent: "",
    path,
    srcRootPath,
  })

  let readmeData = await fileReplacer({
    fsExtra,
    data: emptyReadme({ pathBasename }),
    dest: readmePath,
    createOnly: true,
  })

  readmeData = await fileReplacer({
    fsExtra,
    data: readmeData,
    dest: readmePath,
    replacements: [
      {
        search:
          /<!-- BEGIN NAME -->\n(.*)<!-- END NAME -->/gms,
        replace: `<!-- BEGIN NAME -->\n\n# ${pathBasename}\n\n<!-- END NAME -->`,
      },
      {
        search:
          /<!-- BEGIN DESC -->\n(.*)<!-- END DESC -->/gms,
        replace: `<!-- BEGIN DESC -->\n\n${
          pathDescription || ""
        }\n\n<!-- END DESC -->`,
      },
      {
        search:
          /<!-- BEGIN INPUT -->\n(.*)<!-- END INPUT -->/gms,
        replace: `<!-- BEGIN INPUT -->\n\n\`\`\`ts\n${dedent(
          pathInput
        )}\n\`\`\`\n\n<!-- END INPUT -->`,
      },
      {
        search:
          /<!-- BEGIN OUTPUT -->\n(.*)<!-- END OUTPUT -->/gms,
        replace: `<!-- BEGIN OUTPUT -->\n\n\`\`\`ts\n${dedent(
          pathOutput
        )}\n\`\`\`\n\n<!-- END OUTPUT -->`,
      },
      {
        search:
          /<!-- BEGIN TOC -->\n(.*)<!-- END TOC -->/gms,
        replace: `<!-- BEGIN TOC -->\n\n${toc.trim()}\n\n<!-- END TOC -->`,
      },
      {
        search:
          /<!-- BEGIN BODY -->\n(.*)<!-- END BODY -->/gms,
        replace: `<!-- BEGIN BODY -->\n\n${content.trim()}\n\n<!-- END BODY -->`,
      },
    ],
  })

  return { readmeData, readmePath }
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
            defaultFunctionRawInputType: inputType,
            defaultFunctionRawOutputType: outputType,
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
          const contentLink = `[${simplePath}](${relSrcPath}#L1)`

          toc += `${indent}* ${tocLink}${
            desc ? ` — ${desc}` : ""
          }\n`

          content += `
### ${breadcrumbs} > ${contentLink}
${desc ? `\n${desc}\n` : ""}${
            inputType
              ? `
#### Input

\`\`\`ts
${dedent(inputType)}
\`\`\`
`
              : ""
          }${
            outputType
              ? `
#### Output

\`\`\`ts
${dedent(outputType)}
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

export function dedent(str: string): string {
  if (!str) {
    return ""
  }

  str = str.replace(/(^\n*|\n*$)/g, "")
  const match = str.match(/^\s+/)

  return match
    ? str.replace(new RegExp("^" + match[0], "gm"), "")
    : str
}
