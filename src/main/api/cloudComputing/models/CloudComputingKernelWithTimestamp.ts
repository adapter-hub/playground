import { CloudComputingKernel } from "./CloudComputingKernel"

export interface CloudComputingKernelWithTimestamp {
    kernel: CloudComputingKernel
    lastRun: string
}
