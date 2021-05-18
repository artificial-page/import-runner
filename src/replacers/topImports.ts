import { ReplacementOutputType } from "file-replacer"

export const regex = /^\s*(import\s[^\n]+\n)+/g

export default ({
  imports,
}: {
  imports: string[]
}): ReplacementOutputType => {
  return imports.map((str): ReplacementOutputType[0] => {
    return {
      replace: (m) => m + str + "\n",
      search: regex,
      condition: (body) => !body.includes(str),
    }
  })
}
