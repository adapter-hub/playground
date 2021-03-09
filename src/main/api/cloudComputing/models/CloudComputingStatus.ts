export interface CloudComputingStatus {
    getStatus(): "running" | "queued" | "complete" | "error"
    getFailureMessage(): string | null
}
