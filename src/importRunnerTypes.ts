export interface ImportType {
  default: (arg: Record<string, any>) => Record<string, any>
}

export interface ImportRunnerInput {
  all?: (ImportRunnerInput | Promise<ImportType>)[]
  each?: (ImportRunnerInput | Promise<ImportType>)[]
  memo?: Record<string, any>
  promise?: Promise<ImportType>
}
