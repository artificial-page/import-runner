export const regex =
  /import ([^\s]+) from "(\.?\/?importRunner)"/

export default ({
  data,
}: {
  data: string
}): {
  importStr?: string
  importVarName?: string
} => {
  const match = data.match(regex)

  if (match && match[1]) {
    return {
      importStr: match[0],
      importVarName: match[1],
    }
  }

  return {}
}
