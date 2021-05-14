export default ({ types }: { types: string }): string[] => {
  const typeIdsMatch = types.match(/\w+\??:/g)

  if (typeIdsMatch) {
    return typeIdsMatch.map((str) => str.split(/\??:/)[0])
  }
}
