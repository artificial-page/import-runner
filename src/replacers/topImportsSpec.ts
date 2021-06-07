import { join } from "path"
import expect from "expect"
import fsExtra from "fs-extra"
import topImports from "./topImports"

describe("topImports", () => {
  it("adds import", async () => {
    const path = join(
      __dirname,
      "../../../src/fixtures/testRunner.ts"
    )

    const data = (await fsExtra.readFile(path)).toString()

    expect(
      topImports({
        imports: ['import test from "./test"'],
        data,
      })
    ).toEqual([
      {
        search:
          'import importRunner from "../importRunner"',
        replace:
          'import importRunner from "../importRunner"\nimport test from "./test"',
        condition: expect.any(Function),
      },
    ])
  })
})
