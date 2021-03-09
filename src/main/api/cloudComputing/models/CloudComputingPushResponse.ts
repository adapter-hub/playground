export interface CloudComputingPushResponse {
    hasPushed(): boolean
    getError(): string | null
}
