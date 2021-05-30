import path from "path"
import expect from "expect"
import childPath from "./childPath"

describe("childPath", () => {
  it("determines child path status", () => {
    expect(
      childPath({
        fromPath: path.join(__dirname, "./childPath.ts"),
        toPath: path.join(
          __dirname,
          "../parsers/defaultFunction.ts"
        ),
      })
    ).toBe(false)

    expect(
      childPath({
        fromPath: path.join(__dirname, "./childPath.ts"),
        toPath: path.join(__dirname, "./childPathSpec.ts"),
      })
    ).toBe(true)

    expect(
      childPath({
        fromPath: path.join(
          __dirname,
          "../sourceProcessor.ts"
        ),
        toPath: path.join(__dirname, "./childPathSpec.ts"),
      })
    ).toBe(true)
  })
})
