import expect from "expect"
import fileReplacer from "file-replacer"
import fsExtra from "fs-extra"
import path from "path"
import sourceProcessor from "./sourceProcessor"
import { reset } from "./fixtures/importRunner1Fixture"

export const fixtures = [
  "sourceProcessor",
  "importRunner1",
  "importRunner2",
  "importRunner3",
  "importRunner4",
  "importRunner5",
]

describe("sourceProcessor", () => {
  beforeEach(reset)

  it("runs", async () => {
    // Copy fixtures to tmp
    for (const fixture of fixtures) {
      const tmpPath = `/tmp/${fixture}Fixture.ts`

      await fileReplacer({
        fsExtra,
        src: path.join(
          __dirname,
          `../../src/fixtures/${fixture}Fixture.ts`
        ),
        dest: tmpPath,
      })
    }

    // Process sourceProcessorFixture
    await sourceProcessor({
      fileReplacer,
      fsExtra,
      path: "/tmp/sourceProcessorFixture.ts",
    })

    // Compare with "post" fixtures
    for (const fixture of fixtures) {
      expect(await readTmpFixture(fixture)).toBe(
        await readSrcFixture(`${fixture}Post`)
      )
    }
  })
})

export async function readSrcFixture(
  name: string
): Promise<string> {
  return (
    await fsExtra.readFile(
      path.join(
        __dirname,
        `../../src/fixtures/${name}Fixture.ts`
      )
    )
  ).toString()
}

export async function readTmpFixture(
  name: string
): Promise<string> {
  return (
    await fsExtra.readFile(`/tmp/${name}Fixture.ts`)
  ).toString()
}
