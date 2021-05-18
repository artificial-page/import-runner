import { FlowPath } from "sourceProcessor"
import relPath from "../helpers/relPath"

export default ({
  importPath,
  prevImportPaths,
}: {
  importPath: string
  prevImportPaths: FlowPath[]
}): string[] => {
  return prevImportPaths.map(
    ({ importPath: p, importPathBase }) => {
      const relImportPath = relPath({
        fromPath: importPath,
        toPath: p,
      })

      return `import ${importPathBase} from "${relImportPath}"`
    }
  )
}
