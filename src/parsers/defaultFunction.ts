import topComments from "./topComments"

export const regex =
  /(export default )(.*)(\([^)]*\))(:\s+)(.+)(?=(\s+=>\s+\{))/s

export default ({
  data,
}: {
  data: string
}): {
  defaultFunctionMatch?: RegExpMatchArray
  defaultFunctionOutputType?: string
  defaultFunctionInputType?: string
  defaultFunctionDescription?: string
} => {
  const match = data.match(regex)
  const desc = topComments({ data })

  if (match) {
    const inputType = match[3]
      .match(/\([^:]+:\s*(.+)(?=(\)))/s)[1]
      .split(/(^|\&)\s*(In|Out|InOut)Type</)[0]
      .trim()

    return {
      defaultFunctionMatch: match,
      defaultFunctionOutputType: match[5]
        .replace(/^Promise<(.+)>$/s, (m, p1) => p1)
        .trim(),
      defaultFunctionInputType: inputType,
      defaultFunctionDescription: desc,
    }
  }

  return {}
}
