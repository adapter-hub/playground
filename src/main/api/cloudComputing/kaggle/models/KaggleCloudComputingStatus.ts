import { CloudComputingStatus } from "../../models/CloudComputingStatus"
import { KaggleKernelStatus } from "../../../kaggle/models/KaggleKernelStatus"

export class KaggleCloudComputingStatus implements CloudComputingStatus {
    private status: "running" | "queued" | "complete" | "error"
    private failureMessage: string | null

    constructor(statusResponse: KaggleKernelStatus) {
        this.status = statusResponse.status
        this.failureMessage = statusResponse.failureMessage
    }

    getFailureMessage(): string | null {
        return this.failureMessage
    }

    getStatus(): "running" | "queued" | "complete" | "error" {
        return this.status
    }
}
