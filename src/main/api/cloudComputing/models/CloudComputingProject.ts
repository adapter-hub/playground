import { CloudComputingKernel } from "./CloudComputingKernel"
import { CloudComputingKernelWithTimestamp } from "./CloudComputingKernelWithTimestamp"

export interface CloudComputingProject {
    getKernels(): CloudComputingKernelWithTimestamp[]
    getSheetsId(): Promise<string>
}
