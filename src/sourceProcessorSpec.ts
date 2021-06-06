import expect from "expect"
import { ESLint } from "eslint"
import fileReplacer from "file-replacer"
import fsExtra, { ensureDir, remove } from "fs-extra"
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

const src = path.join(__dirname, "../../src")
const tmp = path.join(__dirname, "../../tmp")

describe("sourceProcessor", () => {
  beforeEach(reset)

  beforeEach(async () => {
    await remove(tmp)
    await ensureDir(tmp)
  })

  afterEach(async () => {
    // await remove(tmp)
  })

  it("runs", async () => {
    // Copy fixtures to tmp
    for (const fixture of fixtures) {
      await fileReplacer({
        fsExtra,
        src: path.join(src, `fixtures/${fixture}.ts`),
        dest: path.join(tmp, `${fixture}.ts`),
      })
    }

    const eslint = new ESLint({ fix: true })

    // Process testRunner
    await sourceProcessor({
      eslint,
      fileReplacer,
      fsExtra,
      path: path.join(tmp, "testRunner.ts"),
      srcRootPath: tmp,
    })

    // Compare with "post" fixtures
    for (const fixture of fixtures) {
      expect(await readTmpFixture(fixture)).toBe(
        await readSrcFixture(`${fixture}Post`)
      )
    }

    // Processes testRunner again
    await sourceProcessor({
      eslint,
      fileReplacer,
      fsExtra,
      path: path.join(tmp, "testRunner.ts"),
      srcRootPath: tmp,
    })

    // Compare with "post" fixtures
    for (const fixture of fixtures) {
      expect(await readTmpFixture(fixture)).toBe(
        await readSrcFixture(`${fixture}Post`)
      )
    }
  }).timeout(10000)
})

export async function readSrcFixture(
  name: string
): Promise<string> {
  return (
    await fsExtra.readFile(
      path.join(src, `fixtures/${name}.ts`)
    )
  ).toString()
}

export async function readTmpFixture(
  name: string
): Promise<string> {
  return (
    await fsExtra.readFile(path.join(tmp, `${name}.ts`))
  ).toString()
}
