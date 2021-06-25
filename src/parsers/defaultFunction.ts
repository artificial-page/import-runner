import topComments from "./topComments"

export const fnRegex = /^(export default)([^(]+)(.+)/ms
export const inputOutputRegex = /(.+)(?=\):)(.+)/s

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
  const fnMatch = data.match(fnRegex)

  const desc = topComments({ data })

  if (fnMatch) {
    const headMatch = fnMatch[3].match(
      /(.+)((>) => {|(}>) => {|(}) => {|(}) {|(}>) {)\n\s{2}/s
    )

    const head =
      headMatch[1] + headMatch.slice(3).find((x) => x)

    const match = head.match(inputOutputRegex)

    if (match) {
      const inputMatch = match[1].match(
        /[\s\(]+([^:]+):\s*(.+)\s*/s
      )

      const inputType = inputMatch[2].split(
        /\s*\&[\s\(]*(In|Out|InOut)Type</
      )[0]

      const outputType = match[2]
        .match(/\):\s*(Promise<)?(.+)$/s)[2]
        ?.replace(/>$/, "")

      return {
        defaultFunctionMatch: match,
        defaultFunctionOutputType:
          trimTypeOutput(outputType),
        defaultFunctionInputName: inputMatch[1],
        defaultFunctionInputType: inputType?.match(
          /^(In|Out|InOut)/
        )
          ? undefined
          : trimTypeOutput(inputType),
        defaultFunctionDescription: desc,
      }
    }
  }

  return {}
}

export function trimTypeOutput(str: string): string {
  if (!str) {
    return
  }

  str = str.trim()

  if (str.includes("\n") && str.includes("\n    ")) {
    return `  ${str}`
  }

  return str
}
