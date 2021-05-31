export interface ImportType {
  default: (arg: any) => Promise<any>
}

export interface ImportRunnerInput {
  all?: (
    | ImportRunnerInput
    | Promise<ImportType>
    | ImportType
  )[]
  each?: (
    | ImportRunnerInput
    | Promise<ImportType>
    | ImportType
  )[]
  memo?: any
  promise?: Promise<ImportType>
}
