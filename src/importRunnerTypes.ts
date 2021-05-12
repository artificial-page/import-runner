export interface ImportType {
  default: (arg: any) => Promise<any>
}

export interface ImportRunnerInput {
  all?: (ImportRunnerInput | Promise<ImportType>)[]
  each?: (ImportRunnerInput | Promise<ImportType>)[]
  memo?: any
  promise?: Promise<ImportType>
}
