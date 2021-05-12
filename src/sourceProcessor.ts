import fileReplacerType from "file-replacer"

export async function sourceProcessor({
  path,
  fileReplacer,
}: {
  path: string
  fileReplacer: typeof fileReplacerType
}): Promise<void> {}
