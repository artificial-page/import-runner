import path from "path"
import relPath from "../helpers/relPath"

export default ({
  importPath,
  inputTypePaths,
}: {
  importPath: string
  inputTypePaths: [string, string[]][]
}): string[] => {
  return inputTypePaths.map(([p]) => {
    const relImportPath = relPath({
      fromPath: importPath,
      toPath: p,
    })

    return `import ${path.basename(
      p,
      ".ts"
    )} from "${relImportPath}"`
  })
}
