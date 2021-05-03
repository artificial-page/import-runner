export async function importRunnerFixture(input: {
  id: string
  startTime: number
  times: [string, number][]
}): Promise<{
  startTime: number
}> {
  const { times } = input

  let { id, startTime } = input

  id = id ?? "bug!"
  startTime = startTime ?? new Date().getTime()

  await delay(5)

  if (times) {
    times.push([id, new Date().getTime() - startTime])
  }

  return {
    [id]: true,
    startTime,
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default importRunnerFixture
