export default (): string => {
  return /* typescript */ `
    import importRunner from "../importRunner"

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
  `.replace(/\n\s{4}/g, "\n")
}
