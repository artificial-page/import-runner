import {
  ReplacementType,
  ReplacementsType,
} from "file-replacer"

export const regex = /^\s*(import(.+)(?=\n{2}))/gms

export default ({
  imports,
  data,
}: {
  imports: string[]
  data: string
}): ReplacementsType => {
  const blocks = data
    .split("\n\n")
    .filter((str) => str.match(/^import/m))

  if (!blocks.length) {
    return [
      {
        replace: imports.join("\n") + "\n\n",
        search: /^/,
      },
    ]
  }

  const lastBlock = blocks[blocks.length - 1]

  return imports
    .slice()
    .reverse()
    .map(
      (str): ReplacementType => ({
        search: lastBlock,
        replace: lastBlock + "\n" + str,
        condition: (body) => !body.includes(str),
      })
    )
}
