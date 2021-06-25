export default ({
  pathBasename,
}: {
  pathBasename: string
}): string => {
  return /* markdown */ `
<!-- BEGIN NAME -->
<!-- END NAME -->

<!-- BEGIN DESC -->
<!-- END DESC -->

## Input

<!-- BEGIN INPUT -->
<!-- END INPUT -->

## Output

<!-- BEGIN OUTPUT -->
<!-- END OUTPUT -->

## Control flow

<!-- BEGIN TOC -->
<!-- END TOC -->

<!-- BEGIN BODY -->
<!-- END BODY -->
  `.trim()
}
