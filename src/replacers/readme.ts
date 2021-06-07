import { basename, dirname, join, relative } from "path"
import fileReplacer from "file-replacer"
import fsExtraType from "fs-extra"
import { FlowPath } from "../sourceProcessor"
import emptyReadme from "../coders/emptyReadme"

export default async ({
  path,
  pathDesc,
  fsExtra,
  prevImportPaths,
  srcRootPath,
}: {
  path: string
  pathDesc: string
  fsExtra: typeof fsExtraType
  prevImportPaths: FlowPath[]
  srcRootPath: string
}): Promise<void> => {
  const pathBasename = basename(path, ".ts")
  const pathDirname = dirname(path)
  const readMePath = join(dirname(path), "README.md")

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
          /<!-- BEGIN AUTO -->\n(.*)<!-- END AUTO -->/gms,
        replace: `
<!-- BEGIN AUTO -->
## Related files

* ${pathLink({
          path,
          pathDirname,
          srcRootPath,
        })}${pathDesc ? ` — ${pathDesc}` : ""}
${prevImportPaths
  .map(
    ({ importPath, description }) =>
      "  * " +
      pathLink({
        path: importPath,
        pathDirname,
        srcRootPath,
      }) +
      (description ? ` — ${description}` : "")
  )
  .join("\n")}

## Control flow

${prevImportPaths
  .filter(({ inputTypes }) => inputTypes)
  .map(({ importPath, inputTypes, description }) => {
    return `
### ${pathLink({
      path: importPath,
      pathDirname,
      srcRootPath,
    })}
${description ? `\n${description}\n` : ""}
\`\`\`typescript
${decurly(inputTypes)}
\`\`\`
`.trim()
  })
  .join("\n")}

## Outputs

${prevImportPaths
  .filter(({ outputTypes }) => outputTypes)
  .map(({ importPath, outputTypes, description }) => {
    return `
### ${pathLink({
      path: importPath,
      pathDirname,
      srcRootPath,
    })}
${description ? `\n${description}\n` : ""}
\`\`\`typescript
${decurly(outputTypes)}
\`\`\`
`.trim()
  })
  .join("\n")}
<!-- END AUTO -->
        `.trim(),
      },
    ],
  })
}

export function decurly(str: string): string {
  const match = str.match(/\{\s*(.+)\s*\}/s)
  str = match && match[1] ? match[1].trim() : str.trim()
  return str.replace(/^\s+/gm, "")
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
