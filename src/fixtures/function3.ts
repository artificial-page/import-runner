import function1 from "./function1"
export * from "./function1"

export default async (
  input: void
): Promise<{ id: string }> => {
  return await function1()
}
