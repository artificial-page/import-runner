export default (): string => {
  return /* typescript */ `
    import importRunner from "import-runner"

    export default async (
      memo: Record<string, never> = {}
    ): Promise<Record<string, never>> => {
      return await importRunner({
        memo,
        each: [
          // import("./myFunction")
        ],
      })
    }
  `
}
