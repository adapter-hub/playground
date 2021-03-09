import { CloudComputingKernelWithTimestamp } from "./CloudComputingKernelWithTimestamp"

export interface CloudComputingProject {
    getKernels(): CloudComputingKernelWithTimestamp[]
    getSheetsId(): Promise<string>
    loadSheetsId(): Promise<string>
}
