export default (): string => {
  return /* typescript */ `
    import importRunner from "import-runner"

    export default async (memo: {
      option: boolean
    }): Promise<any> => {
      return await importRunner({
        memo,
        each: [
          // import("./myFunction")
        ],
      })
    }
  `.replace(/\n[ ]{4}/g, "\n")
}
