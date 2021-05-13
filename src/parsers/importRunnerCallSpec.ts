import { join } from "path"
import expect from "expect"
import fsExtra from "fs-extra"
import importRunnerCall from "./importRunnerCall"
import importRunnerImport from "./importRunnerImport"

describe("importRunnerCall", () => {
  it("parses", async () => {
    const data = (
      await fsExtra.readFile(
        join(
          __dirname,
          "../../../src/sourceProcessorFixture.ts"
        )
      )
    ).toString()

    const { importVarName } = importRunnerImport({ data })

    expect(
      importRunnerCall({ data, importVarName })
    ).toEqual({
      flow: {
        all: [
          "./importRunnerFixture",
          "./importRunnerFixture2",
          "./importRunnerFixture3",
          {
            each: [
              "./importRunnerFixture",
              "./importRunnerFixture2",
              "./importRunnerFixture3",
            ],
          },
        ],
      },
    })
  })
})
