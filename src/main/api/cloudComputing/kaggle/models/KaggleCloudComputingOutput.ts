import {
    CloudComputingOutput,
    CloudComputingOutputFile,
    CloudComputingOutputLine,
} from "../../models/CloudComputingOutput"
import { KaggleKernelOutput } from "../../../kaggle/models/KaggleKernelOutput"

export class KaggleCloudComputingOutput implements CloudComputingOutput {
    private log: CloudComputingOutputLine[]
    private files: CloudComputingOutputFile[]

    constructor(output: KaggleKernelOutput) {
        this.log = output.log
        this.files = output.files
    }

    public getLog(): CloudComputingOutputLine[] {
        return this.log
    }

    getFiles(): CloudComputingOutputFile[] {
        return this.files
    }
}
