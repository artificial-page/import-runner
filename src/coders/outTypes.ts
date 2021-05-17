export default ({
  basenames,
}: {
  basenames: string[]
}): string => {
  return basenames
    .map((str) => /* typescript */ `OutType<typeof ${str}>`)
    .join(" &\n    ")
}
