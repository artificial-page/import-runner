import function1 from "./function1"
export * from "./function1"

export default async (
  input: unknown
): Promise<{ id: string }> => {
  return await function1(input)
}
