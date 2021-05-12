let calls = []
let delayMs: number

export function getCalls(): any[] {
  return calls.map(({ args, delayed }) => ({
    args,
    delayed,
  }))
}

export function getLastCall(): any {
  return calls[calls.length - 1]
}

export function reset(): void {
  calls = []
  delayMs = undefined
}

export function setDelay(ms: number): void {
  delayMs = ms
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async (
  ...args: any[]
): Promise<Record<string, string>> => {
  const id = Math.random().toString(36).substr(2, 9)

  if (delayMs) {
    await delay(delayMs + 1)
  }

  const lastCall = getLastCall()
  const time = new Date().getTime()

  calls.push({
    args,
    id,
    time,
    delayed: lastCall
      ? time - lastCall.time > delayMs
      : false,
  })

  return { id }
}
