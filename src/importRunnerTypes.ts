export interface ImportType {
  default: (arg: any) => any
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
  route?: (
    | ImportRunnerInput
    | Promise<ImportType>
    | ImportType
  )[]
  input?: any
  memo?: any
  promise?: Promise<ImportType>
}
