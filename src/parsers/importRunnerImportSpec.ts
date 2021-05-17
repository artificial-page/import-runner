import { join } from "path"
import expect from "expect"
import fsExtra from "fs-extra"
import importRunnerImport from "./importRunnerImport"

describe("importRunnerImport", () => {
  it("parses", async () => {
    const data = (
      await fsExtra.readFile(
        join(
          __dirname,
          "../../../src/fixtures/testRunner.ts"
        )
      )
    ).toString()

    expect(importRunnerImport({ data })).toEqual({
      importStr:
        'import importRunner from "../importRunner"',
      importVarName: "importRunner",
    })
  })
})
