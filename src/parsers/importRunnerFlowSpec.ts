import { join } from "path"
import expect from "expect"
import fsExtra from "fs-extra"
import importRunnerFlow from "./importRunnerFlow"
import importRunnerImport from "./importRunnerImport"

describe("importRunnerFlow", () => {
  it("parses", async () => {
    const data = (
      await fsExtra.readFile(
        join(
          __dirname,
          "../../../src/fixtures/sourceProcessorFixture.ts"
        )
      )
    ).toString()

    const { importVarName } = importRunnerImport({ data })

    expect(
      importRunnerFlow({ data, importVarName })
    ).toEqual({
      flow: {
        all: [
          "./importRunnerFixture",
          "./importRunner2Fixture",
          "./importRunner3Fixture",
          {
            each: [
              "./importRunnerFixture",
              "./importRunner2Fixture",
              "./importRunner3Fixture",
            ],
          },
        ],
      },
      flowPaths: [
        "./importRunnerFixture",
        "./importRunner2Fixture",
        "./importRunner3Fixture",
        "./importRunnerFixture",
        "./importRunner2Fixture",
        "./importRunner3Fixture",
      ],
      flowPathsUnique: [
        "./importRunnerFixture",
        "./importRunner2Fixture",
        "./importRunner3Fixture",
      ],
    })
  })
})
