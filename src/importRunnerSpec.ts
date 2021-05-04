import expect from "expect"
import importRunner from "./importRunner"
import {
  getLastArg,
  resetArgs,
} from "./importRunnerFixture"

describe("importRunner", () => {
  beforeEach(resetArgs)

  it("runs with path", async () => {
    const out = await importRunner({
      cwd: __dirname,
      path: "importRunnerFixture",
    })
    expect(out).toBeUndefined()
    expect(getLastArg()).toEqual([])
  })

  it("runs with path and input memo", async () => {
    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      input: ["default"],
      path: "importRunnerFixture",
    })
    expect(out).toEqual({ default: { test: true } })
    expect(getLastArg()).toEqual([{ test: true }])
  })

  it("runs with path and output memo", async () => {
    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      output: ["default"],
      path: "importRunnerFixture",
    })
    expect(out).toEqual({
      default: { hello: "world", test: true },
    })
    expect(getLastArg()).toEqual([])
  })

  it("runs with path and input/output memo", async () => {
    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      input: ["default"],
      output: ["default"],
      path: "importRunnerFixture",
    })
    expect(out).toEqual({
      default: { hello: "world", test: true },
    })
    expect(getLastArg()).toEqual([{ test: true }])
  })
})
