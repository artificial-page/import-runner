import function1 from "./function1"
export * from "./function1"

export default async (
  input: Record<string, never>
): Promise<{ id: string }> => {
  return await function1({})
}
