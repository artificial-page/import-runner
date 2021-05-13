import expect from "expect"
import fileReplacer from "file-replacer"
import fsExtra from "fs-extra"
import path from "path"
import sourceProcessor from "./sourceProcessor"
import { reset } from "./importRunnerFixture"

describe("sourceProcessor", () => {
  beforeEach(reset)

  it("runs", async () => {
    const tmpFiles = [
      "sourceProcessorFixture",
      "importRunnerFixture",
      "importRunnerFixture2",
      "importRunnerFixture3",
    ]

    for (const tmpFile of tmpFiles) {
      const tmpPath = `/tmp/${tmpFile}.ts`

      await fileReplacer({
        fsExtra,
        src: path.join(
          __dirname,
          `../../src/${tmpFile}.ts`
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

    expect(
      (
        await fsExtra.readFile(
          "/tmp/importRunnerFixture.ts"
        )
      ).toString()
    ).toBe(
      (
        await fsExtra.readFile(
          path.join(
            __dirname,
            "../../src/importRunnerProcessedFixture.ts"
          )
        )
      ).toString()
    )

    expect(
      (
        await fsExtra.readFile(
          "/tmp/importRunnerFixture2.ts"
        )
      ).toString()
    ).toBe(
      (
        await fsExtra.readFile(
          path.join(
            __dirname,
            "../../src/importRunnerProcessedFixture2.ts"
          )
        )
      ).toString()
    )

    expect(
      (
        await fsExtra.readFile(
          "/tmp/importRunnerFixture3.ts"
        )
      ).toString()
    ).toBe(
      (
        await fsExtra.readFile(
          path.join(
            __dirname,
            "../../src/importRunnerProcessedFixture3.ts"
          )
        )
      ).toString()
    )
  })
})
