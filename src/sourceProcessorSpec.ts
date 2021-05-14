import expect from "expect"
import fileReplacer from "file-replacer"
import fsExtra from "fs-extra"
import path from "path"
import sourceProcessor from "./sourceProcessor"
import { reset } from "./fixtures/importRunnerFixture"

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

describe("sourceProcessor", () => {
  beforeEach(reset)

  it("runs", async () => {
    const tmpFiles = [
      "sourceProcessorFixture",
      "importRunnerFixture",
      "importRunner2Fixture",
      "importRunner3Fixture",
    ]

    for (const tmpFile of tmpFiles) {
      const tmpPath = `/tmp/${tmpFile}.ts`

      await fileReplacer({
        fsExtra,
        src: path.join(
          __dirname,
          `../../src/fixtures/${tmpFile}.ts`
        ),
        dest: tmpPath,
      })
    }

    const tmpPath = "/tmp/sourceProcessorFixture.ts"

    await sourceProcessor({
      fileReplacer,
      fsExtra,
      path: tmpPath,
    })

    expect(await readTmpFixture("sourceProcessor")).toBe(
      await readSrcFixture("sourceProcessorPost")
    )

    expect(await readTmpFixture("importRunner")).toBe(
      await readSrcFixture("importRunnerProcessed")
    )

    expect(await readTmpFixture("importRunner2")).toBe(
      await readSrcFixture("importRunnerProcessed2")
    )

    expect(await readTmpFixture("importRunner3")).toBe(
      await readSrcFixture("importRunnerProcessed3")
    )
  })
})
