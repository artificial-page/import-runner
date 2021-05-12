import expect from "expect"
import fileReplacer from "file-replacer"
import fsExtra from "fs-extra"
import path from "path"
import sourceProcessor from "./sourceProcessor"
import { reset } from "./importRunnerFixture"

describe("sourceProcessor", () => {
  beforeEach(reset)

  it("runs", async () => {
    const tmpPath = "/tmp/sourceProcessorFixture.ts"

    await fileReplacer({
      fsExtra,
      src: path.join(
        __dirname,
        "../../src/sourceProcessorFixture.ts"
      ),
      dest: tmpPath,
    })

    await sourceProcessor({
      fileReplacer,
      fsExtra,
      path: tmpPath,
    })

    expect(
      (await fsExtra.readFile(tmpPath)).toString()
    ).toBe(
      (
        await fsExtra.readFile(
          path.join(
            __dirname,
            "../../src/sourceProcessorPostFixture.ts"
          )
        )
      ).toString()
    )
  })
})
