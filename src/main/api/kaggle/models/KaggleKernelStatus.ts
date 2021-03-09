export interface KaggleKernelStatus {
    failureMessage: string | null
    status: "running" | "queued" | "complete" | "error"
}
