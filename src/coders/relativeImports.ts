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

    const basename = path.basename(p, ".ts")

    return `import ${basename} from "${relImportPath}"`
  })
}
