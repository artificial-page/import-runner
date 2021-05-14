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
          "./importRunner1Fixture",
          "./importRunner2Fixture",
          "./importRunner3Fixture",
          {
            each: [
              "./importRunner1Fixture",
              "./importRunner2Fixture",
              {
                all: [
                  "./importRunner4Fixture",
                  "./importRunner5Fixture",
                ],
              },
              "./importRunner3Fixture",
            ],
          },
        ],
      },
      flowPaths: [
        "./importRunner1Fixture",
        "./importRunner2Fixture",
        "./importRunner3Fixture",
        "./importRunner1Fixture",
        "./importRunner2Fixture",
        "./importRunner4Fixture",
        "./importRunner5Fixture",
        "./importRunner3Fixture",
      ],
      flowPathsUnique: [
        "./importRunner1Fixture",
        "./importRunner2Fixture",
        "./importRunner3Fixture",
        "./importRunner4Fixture",
        "./importRunner5Fixture",
      ],
    })
  })
})
