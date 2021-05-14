import expect from "expect"
import importRunner from "./importRunner"
import {
  getCalls,
  getLastCall,
  setDelay,
  reset,
} from "./fixtures/importRunner1Fixture"

describe("importRunner", () => {
  beforeEach(reset)

  it("runs with promise", async () => {
    const out = await importRunner({
      promise: import("./fixtures/importRunner1Fixture"),
    })
    const { id } = getLastCall()
    expect(out).toEqual({ id })
    expect(getLastCall().args).toEqual([{ id }])
  })

  it("runs with each and memo", async () => {
    setDelay(5)

    const out = await importRunner({
      memo: { test: true },
      each: [
        import("./fixtures/importRunner1Fixture"),
        import("./fixtures/importRunner1Fixture"),
      ],
    })

    const { id } = getLastCall()
    expect(out).toEqual({ id, test: true })
    expect(getCalls()).toEqual([
      {
        args: [{ id, test: true }],
        delayed: false,
      },
      {
        args: [{ id, test: true }],
        delayed: true,
      },
    ])
  })

  it("runs with all and memo", async () => {
    setDelay(5)

    const out = await importRunner({
      memo: { test: true },
      all: [
        import("./fixtures/importRunner1Fixture"),
        import("./fixtures/importRunner1Fixture"),
      ],
    })

    const { id } = getLastCall()
    expect(out).toEqual({ id, test: true })
    expect(getCalls()).toEqual([
      {
        args: [{ id, test: true }],
        delayed: false,
      },
      { args: [{ id, test: true }], delayed: false },
    ])
  })

  it("runs with each -> all", async () => {
    setDelay(5)

    const out = await importRunner({
      each: [
        import("./fixtures/importRunner1Fixture"),
        import("./fixtures/importRunner1Fixture"),
        {
          all: [
            import("./fixtures/importRunner1Fixture"),
            import("./fixtures/importRunner1Fixture"),
          ],
        },
      ],
    })

    const { id } = getLastCall()
    expect(out).toEqual({ id })
    expect(getCalls()).toEqual([
      { args: [{ id }], delayed: false },
      { args: [{ id }], delayed: true },
      { args: [{ id }], delayed: true },
      { args: [{ id }], delayed: false },
    ])
  })

  it("runs with all -> each", async () => {
    setDelay(5)

    const out = await importRunner({
      all: [
        import("./fixtures/importRunner1Fixture"),
        import("./fixtures/importRunner1Fixture"),
        {
          each: [
            import("./fixtures/importRunner1Fixture"),
            import("./fixtures/importRunner1Fixture"),
          ],
        },
      ],
    })

    const { id } = getLastCall()
    expect(out).toEqual({ id })
    expect(getCalls()).toEqual([
      { args: [{ id }], delayed: false },
      { args: [{ id }], delayed: false },
      { args: [{ id }], delayed: false },
      { args: [{ id }], delayed: true },
    ])
  })
})
