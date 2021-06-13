// import expect from "expect"
import { ESLint } from "eslint"
import fileReplacer from "file-replacer"
import fsExtra from "fs-extra"
import path from "path"
import sourceProcessor2 from "./sourceProcessor2"

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

describe("sourceProcessor2", () => {
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

    await sourceProcessor2({
      eslint,
      fileReplacer,
      fsExtra,
      path: path.join(tmp, "testRunner.ts"),
      srcRootPath: tmp,
    })
  }).timeout(10000)
})
