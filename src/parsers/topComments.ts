export const descRegex = /^(\/\/[^\n]+\n)+/g

export default ({ data }: { data: string }): string => {
  const descMatch = data.match(descRegex)

  let desc: string

  if (descMatch) {
    desc = descMatch[0]
      .replace(/^\/\/\s*/gm, "")
      .replace(/\n/g, " ")
      .trim()
  }

  return desc
}
