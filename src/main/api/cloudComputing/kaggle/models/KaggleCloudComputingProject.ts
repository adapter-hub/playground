import { CloudComputingKernelWithTimestamp } from "../../models/CloudComputingKernelWithTimestamp"
import { CloudComputingProject } from "../../models/CloudComputingProject"
import { KaggleCloudComputingAPI } from "../KaggleCloudComputingAPI"
import axios from "axios"
import { KaggleCloudComputingKernelNaming } from "../KaggleCloudComputingKernelNaming"
import { addCorsProxy } from "../../../../toolbox"

export class KaggleCloudComputingProject implements CloudComputingProject {
    private kaggleCloudComputingAPI: KaggleCloudComputingAPI

    private kernels: CloudComputingKernelWithTimestamp[]
    private sheetsId?: string

    constructor(kernels: CloudComputingKernelWithTimestamp[], kaggleCloudComputingAPI: KaggleCloudComputingAPI) {
        this.kernels = kernels
        this.kaggleCloudComputingAPI = kaggleCloudComputingAPI
    }

    public getKernels(): CloudComputingKernelWithTimestamp[] {
        return this.kernels
    }

    public getSheetsId(): Promise<string> {
        const sheetId = this.sheetsId
        if (sheetId) {
            return new Promise((resolve) => {
                resolve(sheetId)
            })
        } else {
            return this.loadSheetsId()
        }
    }

    public async loadSheetsId(): Promise<string> {
        if (this.kernels.length == 0) {
            throw new Error("no kernels in project")
        }

        const oldestKernel = this.kernels.reduce(
            (min, currentValue) => (Date.parse(currentValue.lastRun) < Date.parse(min.lastRun) ? currentValue : min),
            this.kernels[0]
        )

        const output = await this.kaggleCloudComputingAPI.getOutput(oldestKernel.kernel)
        const metaDataFile = output.getFiles().find((file) => file.fileName == "metadata.txt")

        if (!metaDataFile) {
            throw new Error(
                "no metadata found on: " + KaggleCloudComputingKernelNaming.getKaggleName(oldestKernel.kernel)
            )
        }

        const metadata = await axios.get(addCorsProxy(metaDataFile.url as any)).then((res) => res.data)

        const [sheetsUrl] = metadata.split("\n")

        return sheetsUrl
    }
}
