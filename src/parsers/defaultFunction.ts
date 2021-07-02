import topComments from "./topComments"

export const fnRegex = /^(export default)([^(]+)(.+)/ms
export const inputOutputRegex = /(.+)(?=\):)(.+)/s

export default ({
  data,
  pathBasename,
}: {
  data: string
  pathBasename?: string
}): {
  defaultFunctionMatch?: RegExpMatchArray
  defaultFunctionOutputType?: string
  defaultFunctionRawOutputType?: string
  defaultFunctionInputName?: string
  defaultFunctionInputType?: string
  defaultFunctionRawInputType?: string
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
        /[\s\(]+([^:]+):( |\n)(\s*.+)/s
      )

      const inputType = pathBasename
        ? inputMatch[2].split(
            new RegExp(
              `\\s*\\&*[\\s\\(]*(In|Out|InOut)Type<\\s*typeof\\s+${pathBasename}\\s*>`
            )
          )[0]
        : inputMatch[2]

      const outputType = match[2]
        .match(/\):\s*(Promise<)?(.+)$/s)[2]
        ?.replace(/>$/, "")

      return {
        defaultFunctionMatch: match,
        defaultFunctionOutputType: trimType(outputType),
        defaultFunctionRawOutputType: outputType,
        defaultFunctionInputName: inputMatch[1],
        defaultFunctionInputType: trimType(inputType),
        defaultFunctionRawInputType: inputType,
        defaultFunctionDescription: desc,
      }
    }
  }

  return {}
}

export function trimType(str: string): string {
  return str.replace(/(^\s*[|&]\s*|\s*$)/, "")
}
