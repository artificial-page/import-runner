import expect from "expect"
import fileReplacer from "file-replacer"
import fsExtra from "fs-extra"
import path from "path"
import sourceProcessor from "./sourceProcessor"
import { reset } from "./fixtures/function1"

export const fixtures = [
  "testRunner",
  "function1",
  "function2",
  "function3",
  "function4",
  "function5",
]

describe("sourceProcessor", () => {
  beforeEach(reset)

  it("runs", async () => {
    // Copy fixtures to tmp
    for (const fixture of fixtures) {
      const tmpPath = `/tmp/${fixture}.ts`

      await fileReplacer({
        fsExtra,
        src: path.join(
          __dirname,
          `../../src/fixtures/${fixture}.ts`
        ),
        dest: tmpPath,
      })
    }

    // Process sourceProcessorFixture
    await sourceProcessor({
      fileReplacer,
      fsExtra,
      path: "/tmp/testRunner.ts",
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
      path.join(__dirname, `../../src/fixtures/${name}.ts`)
    )
  ).toString()
}

export async function readTmpFixture(
  name: string
): Promise<string> {
  return (
    await fsExtra.readFile(`/tmp/${name}.ts`)
  ).toString()
}
