export default (): string => {
  return /* typescript */ `
    import importRunner from "import-runner"

    export default async (
      input: Record<string, never> = {}
    ): Promise<Record<string, never>> => {
      return await importRunner({
        input,
        each: [
          // import("./myFunction")
        ],
      })
    }
  `
}
