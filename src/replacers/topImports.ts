import { ReplacementOutputType } from "file-replacer"

export const regex = /^\s*(import(.+)(?=\n{2}))/gms

export default ({
  imports,
}: {
  imports: string[]
}): ReplacementOutputType => {
  return [
    {
      search: /^/,
      replace: "\n",
    },
    ...imports.map((str): ReplacementOutputType[0] => {
      return {
        replace: (m) => m.trim() + "\n" + str + "\n\n",
        search: regex,
        condition: (body) => !body.includes(str),
      }
    }),
    ...imports.map((str): ReplacementOutputType[0] => {
      return {
        replace: str + "\n",
        search: /^/,
        condition: (body) => !body.includes(str),
      }
    }),
    {
      replace: (m) => m.trim() + "\n\n",
      search: regex,
    },
  ]
}
