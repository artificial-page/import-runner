import importRunner1Fixture from "./importRunner1Fixture"
export * from "./importRunner1Fixture"

export default async (
  input: unknown
): Promise<{ id: string }> => {
  return await importRunner1Fixture(input)
}
