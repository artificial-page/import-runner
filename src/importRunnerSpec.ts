import expect from "expect"
import importRunner from "./importRunner"
import {
  getCalls,
  getLastCall,
  setDelay,
  reset,
} from "./importRunnerFixture"

describe("importRunner", () => {
  beforeEach(reset)

  it("runs with path", async () => {
    const out = await importRunner({
      cwd: __dirname,
      path: "importRunnerFixture",
    })
    expect(out).toBeUndefined()
    expect(getLastCall().args).toEqual([])
  })

  it("runs with path and input memo", async () => {
    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      input: ["default"],
      path: "importRunnerFixture",
    })
    const { args } = getLastCall()
    expect(out).toEqual({ default: { test: true } })
    expect(args).toEqual([{ test: true }])
  })

  it("runs with path and output memo", async () => {
    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      output: ["default"],
      path: "importRunnerFixture",
    })
    const { args, id } = getLastCall()
    expect(out).toEqual({
      default: { id, test: true },
    })
    expect(args).toEqual([])
  })

  it("runs with path and input/output memo", async () => {
    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      input: ["default"],
      output: ["default"],
      path: "importRunnerFixture",
    })
    const { args, id } = getLastCall()
    expect(out).toEqual({
      default: { id, test: true },
    })
    expect(args).toEqual([{ test: true }])
  })

  it("runs with each", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      each: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
      ],
    })

    expect(out).toBeUndefined()
    expect(getCalls()).toEqual([
      { args: [], delayed: false },
      { args: [], delayed: true },
    ])
  })

  it("runs with each and input memo", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      input: ["default"],
      each: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
      ],
    })

    expect(out).toEqual({ default: { test: true } })
    expect(getCalls()).toEqual([
      { args: [{ test: true }], delayed: false },
      { args: [{ test: true }], delayed: true },
    ])
  })

  it("runs with each and output memo", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      output: ["default"],
      each: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
      ],
    })

    const { id } = getLastCall()
    expect(out).toEqual({ default: { id, test: true } })
    expect(getCalls()).toEqual([
      { args: [], delayed: false },
      { args: [], delayed: true },
    ])
  })

  it("runs with each and input/output memo", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      input: ["default"],
      output: ["default"],
      each: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
      ],
    })

    const { id } = getLastCall()
    expect(out).toEqual({ default: { id, test: true } })
    expect(getCalls()).toEqual([
      { args: [{ test: true }], delayed: false },
      {
        args: [{ id: expect.any(String), test: true }],
        delayed: true,
      },
    ])
  })

  it("runs with all", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      all: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
      ],
    })

    expect(out).toBeUndefined()
    expect(getCalls()).toEqual([
      { args: [], delayed: false },
      { args: [], delayed: false },
    ])
  })

  it("runs with all and input memo", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      input: ["default"],
      all: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
      ],
    })

    expect(out).toEqual({ default: { test: true } })
    expect(getCalls()).toEqual([
      { args: [{ test: true }], delayed: false },
      { args: [{ test: true }], delayed: false },
    ])
  })

  it("runs with all and output memo", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      output: ["default"],
      all: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
      ],
    })

    const { id } = getLastCall()
    expect(out).toEqual({ default: { id, test: true } })
    expect(getCalls()).toEqual([
      { args: [], delayed: false },
      { args: [], delayed: false },
    ])
  })

  it("runs with all and input/output memo", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      memo: { default: { test: true } },
      input: ["default"],
      output: ["default"],
      all: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
      ],
    })

    const { id } = getLastCall()
    expect(out).toEqual({ default: { id, test: true } })
    expect(getCalls()).toEqual([
      { args: [{ test: true }], delayed: false },
      { args: [{ test: true }], delayed: false },
    ])
  })

  it("runs with each -> all", async () => {
    setDelay(5)

    const out = await importRunner({
      cwd: __dirname,
      each: [
        { path: "importRunnerFixture" },
        { path: "importRunnerFixture" },
        {
          all: [
            { path: "importRunnerFixture" },
            { path: "importRunnerFixture" },
          ],
        },
      ],
    })

    expect(out).toBeUndefined()
    expect(getCalls()).toEqual([
      { args: [], delayed: false },
      { args: [], delayed: true },
      { args: [], delayed: true },
      { args: [], delayed: false },
    ])
  })
})
