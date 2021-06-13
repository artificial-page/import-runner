import path from "path"

export default ({
  fromPath,
  toPath,
}: {
  fromPath: string
  toPath: string
}): string => {
  fromPath = path.extname(fromPath)
    ? path.dirname(fromPath)
    : fromPath

  let rel = path
    .relative(fromPath, toPath)
    .replace(/\.ts$/, "")

  if (!rel.startsWith(".")) {
    rel = "./" + rel
  }

  return rel
}
