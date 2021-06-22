import topComments from "./topComments"

export const regex =
  /(export default )(async )?(.+)(?=\):)(.+)(?=\s+=>\s+\{)/s

export default ({
  data,
}: {
  data: string
}): {
  defaultFunctionMatch?: RegExpMatchArray
  defaultFunctionOutputType?: string
  defaultFunctionInputName?: string
  defaultFunctionInputType?: string
  defaultFunctionDescription?: string
} => {
  const match = data.match(regex)
  const desc = topComments({ data })

  if (match) {
    const inputMatch = match[3].match(
      /[\s\(]+([^:]+):\s*(.+)\s*/s
    )

    const inputType = inputMatch[2]
      .split(/\s*\&[\s\(]*(In|Out|InOut)Type</)[0]
      .trim()

    const outputType = match[4].match(
      /\):\s*(Promise<)?([^>]+)(>)?/
    )[2]

    return {
      defaultFunctionMatch: match,
      defaultFunctionOutputType: outputType,
      defaultFunctionInputName: inputMatch[1],
      defaultFunctionInputType: inputType,
      defaultFunctionDescription: desc,
    }
  }

  return {}
}
