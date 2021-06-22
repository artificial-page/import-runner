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
          "../../../src/fixtures/testRunner.ts"
        )
      )
    ).toString()

    const { importVarName } = importRunnerImport({ data })

    expect(
      importRunnerFlow({ data, importVarName })
    ).toEqual({
      flow: {
        all: [
          "./function1",
          "./function2",
          "./function3",
          {
            each: [
              "./function1",
              "./function2",
              {
                route: ["./function4", "./function5"],
              },
              "./function3",
            ],
          },
        ],
      },
      flowPaths: [
        "./function1",
        "./function2",
        "./function3",
        "./function1",
        "./function2",
        "./function4",
        "./function5",
        "./function3",
      ],
      flowPathsUnique: [
        "./function1",
        "./function2",
        "./function3",
        "./function4",
        "./function5",
      ],
    })
  })
})
