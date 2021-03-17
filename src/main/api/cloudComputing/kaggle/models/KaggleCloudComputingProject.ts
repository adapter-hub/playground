import { CloudComputingKernelWithTimestamp } from "../../models/CloudComputingKernelWithTimestamp"
import { CloudComputingProject } from "../../models/CloudComputingProject"
import { KaggleCloudComputingAPI } from "../KaggleCloudComputingAPI"
import axios from "axios"
import { KaggleCloudComputingKernelNaming } from "../KaggleCloudComputingKernelNaming"
import { addCorsProxy } from "../../../../toolbox"
import { CloudComputingKernel } from "../../models/CloudComputingKernel"
import { CloudComputingAPI } from "../../CloudComputingAPI"
import { CloudComputingOutputFile } from "../../models/CloudComputingOutput"

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

    public async getSheetsId(): Promise<string> {
        if (this.sheetsId != null) {
            return this.sheetsId
        } else {
            if (this.kernels.length == 0) {
                throw new Error("no kernels in project")
            }

            const oldestKernel = this.kernels.reduce(
                (min, currentValue) =>
                    Date.parse(currentValue.lastRun) < Date.parse(min.lastRun) ? currentValue : min,
                this.kernels[0]
            )

            const { sheetId } = await KaggleCloudComputingProject.loadSheetsMetadata(
                this.kaggleCloudComputingAPI,
                oldestKernel.kernel
            )
            if (sheetId == null) {
                if (!sheetId) {
                    throw new Error(
                        "no metadata found on: " + KaggleCloudComputingKernelNaming.getKaggleName(oldestKernel.kernel)
                    )
                }
            }
            return sheetId
        }
    }

    public static async loadSheetsMetadata(
        client: CloudComputingAPI,
        kernel: CloudComputingKernel
    ): Promise<{
        sheetId: string
        accuracy?: number
        errors: string | undefined
        warnings: string | undefined
        files: Array<CloudComputingOutputFile>
    }> {
        const output = await client.getOutput(kernel)
        const files = output.getFiles()
        const metaDataFile = files.find((file) => file.fileName == "metadata.txt")

        const warningsFile = files.find((file) => file.fileName === "warnings.txt")
        const errorsFile = files.find((file) => file.fileName === "Error.txt")

        const metadata: string | undefined =
            metaDataFile == null ? undefined : await axios.get(addCorsProxy(metaDataFile.url)).then((res) => res.data)

        const [sheetsId, accuracyString] = metadata?.split("\n") ?? []
        const accuracyFloat = parseFloat(accuracyString)
        const accuracy = isNaN(accuracyFloat) ? undefined : accuracyFloat

        return {
            sheetId: sheetsId,
            accuracy,
            warnings:
                warningsFile == null
                    ? undefined
                    : await axios.get(addCorsProxy(warningsFile.url)).then((res) => res.data),
            errors:
                errorsFile == null ? undefined : await axios.get(addCorsProxy(errorsFile.url)).then((res) => res.data),
            files,
        }
    }
}
