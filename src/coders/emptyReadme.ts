export default ({
  pathBasename,
}: {
  pathBasename: string
}): string => {
  return /* markdown */ `
# ${pathBasename}

<!-- BEGIN AUTO -->
<!-- END AUTO -->
  `.trim()
}
