import path from "path"

export default ({
  inputTypePaths,
  runnerInputType,
}: {
  inputTypePaths: [string, string[]][]
  runnerInputType: string
}): string => {
  const inputTypes = inputTypePaths
    .map(([p, t], i) => {
      const basename = path.basename(p, ".ts")

      const amp =
        inputTypePaths.length - 1 === i ? "" : " &"

      const keys = t.join(", ")

      return /* typescript */ `OutType<typeof ${basename}>${amp} // ${keys}`
    })
    .join("\n    ")

  const spacedRunnerInputType = runnerInputType.replace(
    /\n/g,
    "\n  "
  )

  return `(\n  input: ${spacedRunnerInputType} & ${inputTypes}\n)`
}
