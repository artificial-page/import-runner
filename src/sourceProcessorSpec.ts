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
      "sourceProcessor",
      "importRunner",
      "importRunner2",
      "importRunner3",
    ]

    for (const tmpFile of tmpFiles) {
      const tmpPath = `/tmp/${tmpFile}Fixture.ts`

      await fileReplacer({
        fsExtra,
        src: path.join(
          __dirname,
          `../../src/fixtures/${tmpFile}Fixture.ts`
        ),
        dest: tmpPath,
      })
    }

    await sourceProcessor({
      fileReplacer,
      fsExtra,
      path: "/tmp/sourceProcessorFixture.ts",
    })

    for (const tmpFile of tmpFiles) {
      expect(await readTmpFixture(tmpFile)).toBe(
        await readSrcFixture(`${tmpFile}Post`)
      )
    }
  })
})
