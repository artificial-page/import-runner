import fileReplacerType from "file-replacer"
import fsExtraType from "fs-extra"

export async function sourceProcessor({
  path,
  fileReplacer,
  fsExtra,
}: {
  path: string
  fileReplacer: typeof fileReplacerType
  fsExtra: typeof fsExtraType
}): Promise<void> {}
