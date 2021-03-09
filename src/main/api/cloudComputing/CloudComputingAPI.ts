import { CloudComputingPushResponse } from "./models/CloudComputingPushResponse"
import { CloudComputingOutput } from "./models/CloudComputingOutput"
import { CloudComputingStatus } from "./models/CloudComputingStatus"
import { CloudComputingProject } from "./models/CloudComputingProject"
import { CloudComputingKernel } from "./models/CloudComputingKernel"
import { CloudComputingAuthorizationResponse } from "./models/CloudComputingAuthorizationResponse"

export interface CloudComputingAPI {
    /**
     * Returns a list of the projects metadata from the user
     */
    authorizeCredentials(): Promise<CloudComputingAuthorizationResponse>
    /**
     * Pushes sourcecode to remote computing platform and starts computing
     * @param kernel the repository
     * @param source sourcecode to be pushed
     */
    pushKernel(kernel: CloudComputingKernel, source: string): Promise<CloudComputingPushResponse>

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
