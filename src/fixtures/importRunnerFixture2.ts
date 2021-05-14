import importRunnerFixture from "./importRunnerFixture"
export * from "./importRunnerFixture"

export default async (
  input: unknown
): Promise<{ id: string }> => {
  return await importRunnerFixture(input)
}
