import { FlowPath } from "../sourceProcessor"

export default ({
  defaultFunctionInputType,
  pathBasename,
  prevImportPaths,
}: {
  defaultFunctionInputType: string
  pathBasename: string
  prevImportPaths: FlowPath[]
}): string => {
  const inputTypes = prevImportPaths.map(
    ({ importPathBase, outputTypeIds }, i) => {
      const amp =
        prevImportPaths.length - 1 === i ? "" : " &"

      const keys = outputTypeIds?.join(", ")

      return /* typescript */ `OutType<typeof ${importPathBase}>${amp}${
        keys ? ` // ${keys}` : ""
      }`
    }
  )

  const pathBaseInput = `InType<typeof ${pathBasename}>`

  inputTypes.unshift(
    `${pathBaseInput}${inputTypes.length ? " &" : ""}`
  )

  const input = inputTypes.join("\n")

  if (
    defaultFunctionInputType !== "Record<string, never>"
  ) {
    return `(\ninput: ${defaultFunctionInputType} & ${input}\n)`
  } else {
    return `(\ninput: ${input}\n)`
  }
}
