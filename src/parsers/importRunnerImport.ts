export const importRunnerImportRegex =
  /import ([^\s]+) from "([\.\/]*importRunner|import-runner)"/

export default ({
  data,
}: {
  data: string
}): {
  importStr?: string
  importVarName?: string
} => {
  const match = data.match(importRunnerImportRegex)

  if (match && match[1]) {
    return {
      importStr: match[0],
      importVarName: match[1],
    }
  }

  return {}
}
