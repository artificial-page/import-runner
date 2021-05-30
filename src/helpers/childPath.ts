import relPath from "./relPath"

export default ({
  fromPath,
  toPath,
}: {
  fromPath: string
  toPath: string
}): boolean => {
  const rel = relPath({ fromPath, toPath })
  return rel.slice(0, 2) === "./"
}
