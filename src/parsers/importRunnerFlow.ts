import { ImportRunnerInput } from "../importRunnerTypes"
import { instructions } from "../sourceProcessor"

export const bodyRegexStr = "\\({(.+)(?=\\n\\s\\s})"
export const flowRegex = /\s{4}((all|each|route):\s\[.+)/s
export const importRegex =
  /import\(\s*(["'][^"']+["']\s*)\)/g
export const keyRegex = /(\w+):/g

export interface FlowType {
  all?: (FlowType | string)[]
  each?: (FlowType | string)[]
  route?: (FlowType | string)[]
}

export default ({
  data,
  importVarName,
}: {
  data: string
  importVarName: string
}): {
  flow?: FlowType
  flowPaths?: string[]
  flowPathsUnique?: string[]
} => {
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

      const flow = eval(`({ ${flowBody} })`)
      const flowPaths = pathsFromFlow({ flow })
      const flowPathsUnique = flowPaths.filter(
        (value, index, self) =>
          self.indexOf(value) === index
      )

      return { flow, flowPaths, flowPathsUnique }
    }
  }

  return {}
}

export function pathsFromFlow({
  flow,
  paths,
}: {
  flow: ImportRunnerInput
  paths?: string[]
}): string[] {
  paths = paths || []

  for (const key in flow) {
    if (instructions.includes(key)) {
      if (!Array.isArray(flow[key])) {
        continue
      }
      for (const item of flow[key]) {
        if (typeof item === "string") {
          paths.push(item)
        } else {
          pathsFromFlow({
            flow: item as ImportRunnerInput,
            paths,
          })
        }
      }
    }
  }

  return paths
}
