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
      /* typescript */ `
import { OutType } from "io-type"
import importRunner from "./importRunner"
import importRunnerFixture from "./importRunnerFixture"

export async function runner(memo: {
  hi: boolean
}): OutType<typeof importRunnerFixture> {
  return await importRunner({
    memo,
    all: [
      import("./importRunnerFixture"),
      import("./importRunnerFixture"),
      {
        each: [
          import("./importRunnerFixture"),
          import("./importRunnerFixture"),
        ],
      },
    ],
  })
}`.trim() + "\n"
    )
  })
})
