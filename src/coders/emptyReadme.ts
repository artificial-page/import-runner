export default ({
  pathBasename,
}: {
  pathBasename: string
}): string => {
  return /* markdown */ `
# ${pathBasename}

<!-- BEGIN DESC -->
<!-- END DESC -->

<!-- BEGIN BODY -->
<!-- END BODY -->
  `.trim()
}
