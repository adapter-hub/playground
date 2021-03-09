import { CloudComputingKernelType } from "./CloudComputingKernelType"

export interface CloudComputingKernel {
    name: string
    type: CloudComputingKernelType
    sheetColumn: number
    sheetIdHash: string
}
