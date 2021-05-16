import { join } from "path"
import expect from "expect"
import fsExtra from "fs-extra"
import defaultFunction from "./defaultFunction"

describe("defaultFunction", () => {
  it("parses sourceProcessorFixture", async () => {
    const data = (
      await fsExtra.readFile(
        join(
          __dirname,
          "../../../src/fixtures/sourceProcessorFixture.ts"
        )
      )
    ).toString()

    const {
      defaultFunctionInputType,
      defaultFunctionOutputType,
    } = defaultFunction({ data })

    expect(defaultFunctionInputType).toBe(
      "{\n  hi: boolean\n}"
    )

    expect(defaultFunctionOutputType).toBe("any")
  })

  it("parses importRunner1Fixture", async () => {
    const data = (
      await fsExtra.readFile(
        join(
          __dirname,
          "../../../src/fixtures/importRunner1Fixture.ts"
        )
      )
    ).toString()

    const {
      defaultFunctionInputType,
      defaultFunctionOutputType,
    } = defaultFunction({ data })

    expect(defaultFunctionInputType).toBe("unknown")

    expect(defaultFunctionOutputType).toBe(
      "{ id: string; x?: boolean }"
    )
  })
})
