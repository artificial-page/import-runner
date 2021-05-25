import { FlowPath } from "sourceProcessor"

export default ({
  prevImportPaths,
}: {
  prevImportPaths: FlowPath[]
}): string => {
  const inputTypes = prevImportPaths
    .map(({ importPathBase, outputTypeIds }, i) => {
      const amp =
        prevImportPaths.length - 1 === i ? "" : " &"

      const keys = outputTypeIds.join(", ")

      return /* typescript */ `InOutType<typeof ${importPathBase}>${amp} // ${keys}`
    })
    .join("\n    ")

  return `(\n  input: ${inputTypes}\n)`
}
