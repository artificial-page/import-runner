export default (): string => {
  return /* typescript */ `
    export default async (input: Record<string, never>): Promise<any> => {
      return {}
    }
  `
}
