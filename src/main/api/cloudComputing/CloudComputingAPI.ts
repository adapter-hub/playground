import { CloudComputingPushResponse } from "./models/CloudComputingPushResponse"
import { CloudComputingOutput } from "./models/CloudComputingOutput"
import { CloudComputingStatus } from "./models/CloudComputingStatus"
import { CloudComputingProject } from "./models/CloudComputingProject"
import { CloudComputingKernel } from "./models/CloudComputingKernel"
import { CloudComputingAuthorizationResponse } from "./models/CloudComputingAuthorizationResponse"
import { CloudComputingFile } from "./models/CloudComputingFile"

export interface CloudComputingAPI {
    /**
     * Returns a list of the projects metadata from the user
     */
    authorizeCredentials(): Promise<CloudComputingAuthorizationResponse>
    /**
     * Pushes sourcecode to remote computing platform and starts computing
     * @param kernel the repository
     * @param source sourcecode to be pushed
     * @param file additional data file
     */
    pushKernel(
        kernel: CloudComputingKernel,
        source: string,
        file?: CloudComputingFile
    ): Promise<CloudComputingPushResponse>

    /**
     * Uploads file to remote computing platform
     * @param fileContent content to be uploaded
     * @param onUploadProgress is called during upload,
     *      @param progress: number between 0 and 1, 0:start, 1:finished
     * @return reference to the file
     */
    uploadFile(fileContent: ArrayBuffer, onUploadProgress: (progress: number) => void): Promise<CloudComputingFile>

    /**
     * Pulls log and output files from the repository
     * @param kernel the repository
     */
    getOutput(kernel: CloudComputingKernel): Promise<CloudComputingOutput>

    /**
     * Pulls the status of the kernel
     * @param kernel the repository
     */
    getStatus(kernel: CloudComputingKernel): Promise<CloudComputingStatus>

    /**
     * Returns a list of the projects metadata from the user
     */
    getProjects(): Promise<CloudComputingProject[]>
}
