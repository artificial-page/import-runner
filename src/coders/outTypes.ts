export default ({
  basenames,
  type,
}: {
  basenames: string[]
  type: "InOut" | "Out" | "In"
}): string => {
  return basenames
    .map(
      (str) => /* typescript */ `${type}Type<typeof ${str}>`
    )
    .join(" &\n    ")
}
