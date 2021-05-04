let receivedArgs = []

export function getArgs(): any[] {
  return receivedArgs
}

export function getLastArg(): any[] {
  return receivedArgs[receivedArgs.length - 1]
}

export function resetArgs(): void {
  receivedArgs = []
}

export default (...args: any[]): Record<string, string> => {
  receivedArgs.push(args)
  return { hello: "world" }
}
