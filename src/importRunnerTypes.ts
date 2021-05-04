export interface ImportRunnerInput {
  path?: string
  cwd?: string
  all?: ImportRunnerInput[]
  each?: ImportRunnerInput[]
  memo?: Record<string, any>
  input?: string[]
  output?: string[]
  skip?: (input: ImportRunnerInput) => boolean
}
