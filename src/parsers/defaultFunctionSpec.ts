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
    } = defaultFunction({ data })

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
    } = defaultFunction({ data })

    expect(defaultFunctionInputType).toBe(
      "Record<string, never>"
    )

    expect(defaultFunctionOutputType).toBe(
      "{ id: string; x?: boolean }"
    )
  })
})
