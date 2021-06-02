import { KaggleKernelOutputFile } from "./KaggleKernelOutputFile"
import { KaggleKernelOutputLine } from "./KaggleKernelOutputLine"

export interface KaggleKernelOutput {
    files: KaggleKernelOutputFile[]
    log: KaggleKernelOutputLine[]
    nextPageToken: string | null
}
