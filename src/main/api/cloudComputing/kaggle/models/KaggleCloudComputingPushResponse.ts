import { CloudComputingPushResponse } from "../../models/CloudComputingPushResponse"
import { KaggleKernelPushResponse } from "../../../kaggle/models/KaggleKernelPushResponse"

export class KaggleCloudComputingPushResponse implements CloudComputingPushResponse {
    private pushed: boolean
    private error: string | null

    constructor(pushResponse: KaggleKernelPushResponse) {
        this.pushed = pushResponse.ref !== null
        this.error = pushResponse.error
    }

    public hasPushed(): boolean {
        return this.pushed
    }

    public getError(): string | null {
        return this.error
    }
}
