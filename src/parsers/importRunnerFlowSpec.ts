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
      flowPaths: [
        "./importRunnerFixture",
        "./importRunnerFixture2",
        "./importRunnerFixture3",
        "./importRunnerFixture",
        "./importRunnerFixture2",
        "./importRunnerFixture3",
      ],
      flowPathsUnique: [
        "./importRunnerFixture",
        "./importRunnerFixture2",
        "./importRunnerFixture3",
      ],
    })
  })
})
