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
        /\(\n?( *)([^:]+):( |\n)(\s*.+)/s
      )

      const inputIndent = inputMatch[1]

      const inputType =
        inputIndent + pathBasename
          ? inputMatch[4].split(
              new RegExp(
                `\\s*\\&*[\\s\\(]*(In|Out|InOut)Type<\\s*typeof\\s+${pathBasename}\\s*>`
              )
            )[0]
          : inputMatch[4]

      const outputMatch = match[2].match(
        /\):(\n| )?(\s*)(Promise<)?(.+)$/s
      )

      const outputIndent = outputMatch[2]

      const outputType = outputMatch[4]
        ? outputIndent + outputMatch[4]?.replace(/>$/, "")
        : undefined

      return {
        defaultFunctionMatch: match,
        defaultFunctionOutputType: trimType(outputType),
        defaultFunctionRawOutputType: outputType,
        defaultFunctionInputName: inputMatch[2],
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
