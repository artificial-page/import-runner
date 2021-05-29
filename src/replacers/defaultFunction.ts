import { ReplacementOutputType } from "file-replacer"
import { regex } from "../parsers/defaultFunction"
import { FlowPath } from "sourceProcessor"

export default ({
  prevImportPaths,
}: {
  prevImportPaths: FlowPath[]
}): ReplacementOutputType => {
  const filteredInputs = prevImportPaths.filter(
    ({ inputTypes }) =>
      inputTypes && inputTypes !== "Record<string, never>"
  )

  const filteredOutputs = prevImportPaths.filter(
    ({ outputTypes }) => outputTypes
  )

  const inputs = filteredInputs
    .map(({ inputTypes, importPathBase }, i) => {
      const amp =
        i === filteredInputs.length - 1 ? "" : " &"
      inputTypes = inputTypes.replace(
        /^\s*\{\s*/,
        `{\n// ${importPathBase} input\n`
      )
      return `${inputTypes}${amp}`
    })
    .join("\n")

  const outputs = filteredOutputs
    .map(({ outputTypes, importPathBase }, i) => {
      const amp =
        i === filteredOutputs.length - 1 ? "" : " &"
      outputTypes = outputTypes.replace(
        /^\s*\{\s*/,
        `{\n// ${importPathBase} output\n`
      )
      return `${outputTypes}${amp}`
    })
    .join("\n")

  return [
    {
      replace: (m, p1, p2, p3, p4, p5) => {
        const x = `${p1}${p2}${`(\n  memo: ${
          inputs || "Record<string, never> = {}"
        }\n)`}${p4}${
          p5.match(/^Promise</) ? "Promise<" : ""
        }\n  ${inputs ? inputs + " &" : ""}${
          outputs || "any"
        }\n${p5.match(/^Promise</) ? ">" : ""}`
        return x
      },
      search: regex,
    },
  ]
}
