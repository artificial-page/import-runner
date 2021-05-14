export const regex =
  /(export default )(.+)(\([^)]*\))(:\s*)(Promise<)?(\{.+}|any)(>)?(\s*)(=>|{)/s

export default ({
  data,
}: {
  data: string
}): {
  outputTypeMatch?: RegExpMatchArray
  outputType?: string
} => {
  const match = data.match(regex)

  if (match) {
    return {
      outputTypeMatch: match,
      outputType: match[6],
    }
  }

  return {}
}
