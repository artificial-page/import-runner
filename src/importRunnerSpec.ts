import expect from "expect"
import importRunner from "./importRunner"

async function fixtureRunner({
  memo,
  times,
}: {
  memo: boolean
  times: [string, number][]
}): Promise<any> {
  return await importRunner({
    arg: { times },
    cwd: __dirname,
    all: [
      {
        path: "importRunnerFixture",
        arg: { id: "a1.0" },
      },
      {
        path: "importRunnerFixture",
        arg: { id: "a1.1" },
      },
      {
        each: [
          {
            path: "importRunnerFixture",
            arg: { id: "a1.2-e1.0" },
          },
          {
            path: "importRunnerFixture",
            arg: { id: "a1.2-e1.1" },
          },
          {
            all: [
              {
                path: "importRunnerFixture",
                arg: { id: "a1.2-e1.2-a1.0" },
              },
              {
                path: "importRunnerFixture",
                arg: { id: "a1.2-e1.2-a1.1" },
              },
            ],
          },
        ],
      },
    ],
    each: [
      {
        path: "importRunnerFixture",
        arg: { id: "e2.0" },
      },
      {
        path: "importRunnerFixture",
        arg: { id: "e2.1" },
      },
      {
        all: [
          {
            path: "importRunnerFixture",
            arg: { id: "e2.2-a1.0" },
          },
          {
            path: "importRunnerFixture",
            arg: { id: "e2.2-a1.1" },
          },
        ],
      },
    ],
    memo,
  })
}

describe("importRunner", () => {
  it("with memo", async () => {
    const times = []
    const out = await fixtureRunner({ memo: true, times })

    expect(out).toEqual({
      startTime: expect.any(Number),
      times: [
        ["a1.0", expect.any(Number)],
        ["a1.1", expect.any(Number)],
        ["a1.2-e1.0", expect.any(Number)],
        ["a1.2-e1.1", expect.any(Number)],
        ["a1.2-e1.2-a1.0", expect.any(Number)],
        ["a1.2-e1.2-a1.1", expect.any(Number)],
        ["e2.0", expect.any(Number)],
        ["e2.1", expect.any(Number)],
        ["e2.2-a1.0", expect.any(Number)],
        ["e2.2-a1.1", expect.any(Number)],
      ],
      "a1.0": true,
      "a1.1": true,
      "a1.2-e1.0": true,
      "a1.2-e1.1": true,
      "a1.2-e1.2-a1.0": true,
      "a1.2-e1.2-a1.1": true,
      "e2.0": true,
      "e2.1": true,
      "e2.2-a1.0": true,
      "e2.2-a1.1": true,
    })

    // a1.0 -> a1.1
    expect(times[1][1] - times[0][1]).toBeLessThan(5)

    // a1.1 -> a1.2-e1.0
    expect(times[2][1] - times[1][1]).toBeLessThan(5)

    // a1.2-e1.0 -> a1.2-e1.1
    expect(
      times[3][1] - times[2][1]
    ).toBeGreaterThanOrEqual(5)

    // a1.2-e1.1 -> a1.2-e1.2-a1.0
    expect(
      times[4][1] - times[3][1]
    ).toBeGreaterThanOrEqual(5)

    // a1.2-e1.2-a1.0 -> a1.2-e1.2-a1.1
    expect(times[5][1] - times[4][1]).toBeLessThan(5)

    // a1.2-e1.2-a1.1 -> e2.0
    expect(
      times[6][1] - times[5][1]
    ).toBeGreaterThanOrEqual(5)

    // e2.0 -> e2.1
    expect(
      times[7][1] - times[6][1]
    ).toBeGreaterThanOrEqual(5)

    // e2.1 -> e2.2-a1.0
    expect(
      times[8][1] - times[7][1]
    ).toBeGreaterThanOrEqual(5)

    // e2.2-a1.0 -> e2.2-a1.1
    expect(times[9][1] - times[8][1]).toBeLessThan(5)
  })

  it("without memo", async () => {
    const times = []
    const out = await fixtureRunner({ memo: false, times })
    expect(out).toEqual({ times })
  })
})
