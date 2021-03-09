import { KaggleKernelPullBlob } from "./KaggleKernelPullBlob"
import { KaggleKernelPullMetadata } from "./KaggleKernelPullMetadata"

export interface KaggleKernelPull {
    blob: KaggleKernelPullBlob
    metadata: KaggleKernelPullMetadata
}
