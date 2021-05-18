import { FlowPath } from "sourceProcessor"

export default ({
  prevImportPaths,
  runnerInputType,
}: {
  prevImportPaths: FlowPath[]
  runnerInputType: string
}): string => {
  const inputTypes = prevImportPaths
    .map(({ importPathBase, outputTypeIds }, i) => {
      const amp =
        prevImportPaths.length - 1 === i ? "" : " &"

      const keys = outputTypeIds.join(", ")

      return /* typescript */ `OutType<typeof ${importPathBase}>${amp} // ${keys}`
    })
    .join("\n    ")

  const spacedRunnerInputType = runnerInputType.replace(
    /\n/g,
    "\n  "
  )

  return `(\n  input: ${spacedRunnerInputType} & ${inputTypes}\n)`
}
