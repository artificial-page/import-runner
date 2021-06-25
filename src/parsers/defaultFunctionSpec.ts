import { join } from "path"
import expect from "expect"
import fsExtra from "fs-extra"
import defaultFunction from "./defaultFunction"

describe("defaultFunction", () => {
  it("parses testRunner", async () => {
    const data = (
      await fsExtra.readFile(
        join(
          __dirname,
          "../../../src/fixtures/testRunner.ts"
        )
      )
    ).toString()

    const {
      defaultFunctionInputType,
      defaultFunctionOutputType,
      defaultFunctionDescription,
    } = defaultFunction({ data })

    expect(defaultFunctionDescription).toBe(
      "This is the test runner. It does some stuff."
    )

    expect(defaultFunctionInputType).toBe(
      "Record<string, never> = {}"
    )

    expect(defaultFunctionOutputType).toBe("any")
  })

  it("parses function1", async () => {
    const data = (
      await fsExtra.readFile(
        join(
          __dirname,
          "../../../src/fixtures/function1.ts"
        )
      )
    ).toString()

    const {
      defaultFunctionInputType,
      defaultFunctionOutputType,
      defaultFunctionDescription,
    } = defaultFunction({ data })

    expect(defaultFunctionDescription).toBeUndefined()

    expect(defaultFunctionInputType).toBe(
      "Record<string, never>"
    )

    expect(defaultFunctionOutputType).toBe(
      "{ id: string; x?: boolean }"
    )
  })

  it("parses test case", async () => {
    const data = `
import { OutType } from "io-type"
import { InType } from "io-type"

export default (
  input: InType<typeof ssm> &
    (OutType<typeof nodeEnv> & OutType<typeof projectYaml>)
): { ssmClient: SSM } => {
  return { ssmClient: new SSM() }
}`

    const {
      defaultFunctionInputType,
      defaultFunctionOutputType,
      defaultFunctionDescription,
    } = defaultFunction({ data, pathBasename: "nodeEnv" })

    expect(defaultFunctionDescription).toBeUndefined()

    expect(defaultFunctionInputType).toBe(
      "InType<typeof ssm>"
    )

    expect(defaultFunctionOutputType).toBe(
      "{ ssmClient: SSM }"
    )
  })

  it("parses test case 2", async () => {
    const data = `// Retrieve parsed [project.yml](../../../project.yml) data.

import { OutType } from "io-type"
import nodeEnv from "./nodeEnv"
import projectYamlLoader, {
  ProjectYamlType,
} from "libs/projectYamlLoader/projectYamlLoader"

export default async (
  input: OutType<typeof nodeEnv>
): Promise<{
  projectYaml: ProjectYamlType
}> => {
  return {
    projectYaml: await projectYamlLoader(input.nodeEnv),
  }
}`

    const {
      defaultFunctionInputType,
      defaultFunctionOutputType,
      defaultFunctionDescription,
    } = defaultFunction({ data })

    expect(defaultFunctionDescription).toBe(
      "Retrieve parsed [project.yml](../../../project.yml) data."
    )

    expect(defaultFunctionInputType).toBe(
      "OutType<typeof nodeEnv>"
    )

    expect(defaultFunctionOutputType).toBe(
      `{
  projectYaml: ProjectYamlType
}`
    )
  })
})
