export default (): string => {
  return /* typescript */ `
    export default async (input: unknown): Promise<any> => {
      return {}
    }
  `.replace(/\n\s{4}/g, "\n")
}
