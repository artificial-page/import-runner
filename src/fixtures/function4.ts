import function1 from "./function1"
export * from "./function1"

export default async (input: {
  fn4Input: boolean
}): Promise<{ id: string }> => {
  return await function1()
}
