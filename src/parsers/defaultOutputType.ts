export const regex =
  "}\\):\\s(Promise<Record<string,\\sany>>|Promise<any>|any)\\s{"

export default ({
  data,
}: {
  data: string
}): {
  defaultOutputMatch: string
  defaultOutputType: string
} => {
  const match = data.match(regex)
  return {
    defaultOutputMatch: match[0],
    defaultOutputType: match[1],
  }
}
