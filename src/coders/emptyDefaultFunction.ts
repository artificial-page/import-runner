export default (): string => {
  return /* typescript */ `
    export default async (input: unknown): Promise<any> => {
      return {}
    }
  `.replace(/\n[ ]{2}/g, "\n")
}
