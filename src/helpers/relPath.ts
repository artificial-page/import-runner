import path from "path"

export default ({
  fromPath,
  toPath,
}: {
  fromPath: string
  toPath: string
}): string => {
  let rel = path
    .relative(path.dirname(fromPath), toPath)
    .replace(/\.ts$/, "")

  if (!rel.startsWith(".")) {
    rel = "./" + rel
  }

  return rel
}
