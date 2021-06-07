import { basename, dirname, join, relative } from "path"
import fileReplacer from "file-replacer"
import fsExtraType from "fs-extra"
import { FlowPath } from "../sourceProcessor"
import emptyReadme from "../coders/emptyReadme"

export default async ({
  path,
  fsExtra,
  prevImportPaths,
  srcRootPath,
}: {
  path: string
  fsExtra: typeof fsExtraType
  prevImportPaths: FlowPath[]
  srcRootPath: string
}): Promise<void> => {
  const pathBasename = basename(path, ".ts")
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

* [${relative(srcRootPath, path)}](${basename(path)})
${prevImportPaths
  .map(({ importPath }) => {
    const relPath = relative(srcRootPath, importPath)
    return `    * [${relPath}](${relPath})`
  })
  .join("\n")}

## Inputs

${prevImportPaths
  .filter(({ inputTypes }) => inputTypes)
  .map(({ importPath, inputTypes }) => {
    const relPath = relative(srcRootPath, importPath)
    return `
### [${relPath}](${relPath})

\`\`\`typescript
${decurly(inputTypes)}
\`\`\`
`.trim()
  })
  .join("\n")}

## Outputs

${prevImportPaths
  .filter(({ outputTypes }) => outputTypes)
  .map(({ importPath, outputTypes }) => {
    const relPath = relative(srcRootPath, importPath)
    return `
### [${relPath}](${relPath})

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
