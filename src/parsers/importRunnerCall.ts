import { ImportRunnerInput } from "importRunnerTypes"

export const bodyRegexStr = "\\({(.+)(?=\\n\\s\\s})"
export const flowRegex = /\s{4}((all|each):\s\[.+)/s
export const importRegex = /import\((["'][^"']+["'])\)/g
export const keyRegex = /(\w+):/g

export default ({
  data,
  importVarName,
}: {
  data: string
  importVarName: string
}): { flow?: ImportRunnerInput } => {
  const match = data.match(
    new RegExp(importVarName + bodyRegexStr, "s")
  )

  if (match && match[1]) {
    const body = match[1]
    const flowMatch = body.match(flowRegex)

    if (flowMatch) {
      const flowBody = flowMatch[1]
        .replace(importRegex, (m, p1) => p1)
        .replace(keyRegex, (m, p1) => `"${p1}":`)

      return { flow: eval(`({ ${flowBody} })`) }
    }
  }

  return {}
}
