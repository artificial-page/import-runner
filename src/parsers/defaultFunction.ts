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

    const inputType = inputMatch[2].split(
      /\s*\&[\s\(]*(In|Out|InOut)Type</
    )[0]

    const outputType = match[4]
      .match(/\):\s*(Promise<)?(.+)$/s)[2]
      ?.replace(/>$/, "")

    return {
      defaultFunctionMatch: match,
      defaultFunctionOutputType: trimTypeOutput(outputType),
      defaultFunctionInputName: inputMatch[1],
      defaultFunctionInputType: inputType?.match(
        /^(In|Out|InOut)/
      )
        ? undefined
        : trimTypeOutput(inputType),
      defaultFunctionDescription: desc,
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
