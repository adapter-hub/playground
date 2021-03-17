import { KaggleApi } from "../../kaggle/KaggleAPI"
import { CloudComputingAPI } from "../CloudComputingAPI"
import { KaggleKernelPushRequest } from "../../kaggle/models/KaggleKernelPushRequest"
import { CloudComputingPushResponse } from "../models/CloudComputingPushResponse"
import { CloudComputingOutput } from "../models/CloudComputingOutput"
import { CloudComputingStatus } from "../models/CloudComputingStatus"
import { KaggleCloudComputingOutput } from "./models/KaggleCloudComputingOutput"
import { KaggleCloudComputingStatus } from "./models/KaggleCloudComputingStatus"
import { KaggleCloudComputingPushResponse } from "./models/KaggleCloudComputingPushResponse"
import { KaggleKernelListRequest } from "../../kaggle/models/KaggleKernelListRequest"
import { KaggleCloudComputingKernelNaming } from "./KaggleCloudComputingKernelNaming"
import { CloudComputingKernel } from "../models/CloudComputingKernel"
import { CloudComputingAuthorizationResponse } from "../models/CloudComputingAuthorizationResponse"
import { CloudComputingKernelWithTimestamp } from "../models/CloudComputingKernelWithTimestamp"
import { KaggleKernelListItem } from "../../kaggle/models/KaggleKernelListItem"
import { KaggleCloudComputingProject } from "./models/KaggleCloudComputingProject"
import { CloudComputingProject } from "../models/CloudComputingProject"
import { CloudComputingKernelType } from "../models/CloudComputingKernelType"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"
import { addCorsProxy } from "../../../toolbox"

export class KaggleCloudComputingAPI implements CloudComputingAPI {
    private kaggleApi: KaggleApi
    private userName: string

    constructor(userName: string, apiToken: string) {
        this.userName = userName
        this.kaggleApi = new KaggleApi(userName, apiToken)
    }

    async authorizeCredentials(): Promise<CloudComputingAuthorizationResponse> {
        // send random status request and see if response is: 401 unauthorized
        try {
            await this.getStatus({
                name: "aaaaa",
                type: CloudComputingKernelType.analysis,
                sheetColumn: 1,
                sheetIdHash: "asdsad",
            })
        } catch (error) {
            if (error.message == "Request failed with status code 401") {
                return { isAuthorized: false }
            } else if (error.message == "Request failed with status code 404") {
                return { isAuthorized: true }
            } else {
                throw error
            }
        }
        return { isAuthorized: true }
    }

    public pushKernel(
        kernel: CloudComputingKernel,
        source: string,
        file?: string
    ): Promise<CloudComputingPushResponse> {
        const kaggleKernelName = KaggleCloudComputingKernelNaming.getKaggleName(kernel)

        const kernelPushRequest = new KaggleKernelPushRequest(
            this.userName,
            kaggleKernelName,
            source,
            "python",
            "script"
        )
        kernelPushRequest.setIsPrivate(true)
        kernelPushRequest.setEnableGpu(true)
        kernelPushRequest.setEnableInternet(true)
        kernelPushRequest.setDockerImagePinningType("original")

        if (file) {
            kernelPushRequest.setDatasetDataSources([file])
        }

        return this.kaggleApi
            .kernelPush(kernelPushRequest)
            .then((response) => new KaggleCloudComputingPushResponse(response))
    }

    public async uploadFile(fileContent: ArrayBuffer, onUploadProgress: (progress: number) => void): Promise<string> {
        const contentLength = fileContent.byteLength

        const updateTime = 100

        const fileRegisterEstimatedTime = 400
        const contentUploadEstimatedTime = contentLength / 1000
        const datasetRegisterEstimatedTime = 2000

        const totalEstimatedTime = fileRegisterEstimatedTime + contentUploadEstimatedTime + datasetRegisterEstimatedTime

        const fileRegisterEstimatedPercent = fileRegisterEstimatedTime / totalEstimatedTime
        const contentUploadEstimatedPercent = contentUploadEstimatedTime / totalEstimatedTime
        const datasetRegisterEstimatedPercent = datasetRegisterEstimatedTime / totalEstimatedTime

        const fileUpload = await this.registerFile(
            contentLength,
            (updateTime / fileRegisterEstimatedTime) * fileRegisterEstimatedPercent,
            updateTime,
            onUploadProgress
        )

        await this.uploadContent(
            addCorsProxy(fileUpload.createUrl),
            fileContent,
            fileRegisterEstimatedPercent,
            contentUploadEstimatedPercent,
            onUploadProgress
        )

        const datasetReference = await this.registerDataset(
            fileUpload.token,
            fileRegisterEstimatedPercent + contentUploadEstimatedPercent,
            (updateTime / datasetRegisterEstimatedTime) * datasetRegisterEstimatedPercent,
            updateTime,
            onUploadProgress
        )

        onUploadProgress(1)

        return Promise.resolve(datasetReference)
    }

    private setCountedInterval(onInterval: (progress: number) => void, updateTime: number) {
        let fileIntervalCounter = 0
        return setInterval(() => {
            fileIntervalCounter++
            onInterval(fileIntervalCounter)
        }, updateTime)
    }

    private async registerFile(
        contentLength: number,
        updatePercent: number,
        updateTime: number,
        onUploadProgress: (progress: number) => void
    ) {
        const fileRegisterInterval = this.setCountedInterval((iteration: number) => {
            onUploadProgress(iteration * updatePercent)
        }, updateTime)

        let fileUpload = null
        try {
            fileUpload = await this.kaggleApi.uploadFile({
                fileName: "default",
                contentLength: contentLength,
                lastModified: 0,
            })
        } catch (error) {
            clearInterval(fileRegisterInterval)
            throw error
        }

        clearInterval(fileRegisterInterval)
        return fileUpload
    }

    private async uploadContent(
        url: string,
        data: any,
        finishedPercent: number,
        contentUploadEstimatedPercent: number,
        onUploadProgress: (progress: number) => void
    ) {
        await axios.post(url, data, {
            onUploadProgress: (progressEvent) => {
                const progress = progressEvent.loaded / progressEvent.total
                onUploadProgress(progress * contentUploadEstimatedPercent + finishedPercent)
            },
        })
    }

    private async registerDataset(
        fileUploadToken: string,
        finishedPercent: number,
        updatePercent: number,
        updateTime: number,
        onUploadProgress: (progress: number) => void
    ) {
        const datasetRegisterInterval = this.setCountedInterval((iteration: number) => {
            onUploadProgress(Math.min(iteration * updatePercent + finishedPercent, 1))
        }, updateTime)

        const datasetSlug = uuidv4()
        try {
            await this.kaggleApi.createDataset(this.userName, datasetSlug, fileUploadToken)
        } catch (error) {
            clearInterval(datasetRegisterInterval)
            throw error
        }

        clearInterval(datasetRegisterInterval)
        return this.userName + "/" + datasetSlug
    }

    public getOutput(kernel: CloudComputingKernel): Promise<CloudComputingOutput> {
        const kaggleKernelName = KaggleCloudComputingKernelNaming.getKaggleName(kernel)

        return this.kaggleApi
            .kernelOutput(this.userName, kaggleKernelName)
            .then((output) => new KaggleCloudComputingOutput(output))
    }

    public getStatus(kernel: CloudComputingKernel): Promise<CloudComputingStatus> {
        const kaggleKernelName = KaggleCloudComputingKernelNaming.getKaggleName(kernel)

        return this.kaggleApi
            .kernelStatus(this.userName, kaggleKernelName)
            .then((status) => new KaggleCloudComputingStatus(status))
    }

    private sheetIdHashAndProjectName(sheetIdHash: string, projectName: string): string {
        return `${projectName}/${sheetIdHash}`
    }

    public async getProjects(): Promise<CloudComputingProject[]> {
        const kernels = await this.getKernelList()
        const groups = new Map()

        for (const kernel of kernels) {
            const fullProjectIdentifier = this.sheetIdHashAndProjectName(kernel.kernel.sheetIdHash, kernel.kernel.name)
            if (groups.has(fullProjectIdentifier)) {
                groups.get(fullProjectIdentifier).push(kernel)
            } else {
                groups.set(fullProjectIdentifier, [kernel])
            }
        }

        const projects = []

        for (const group of Array.from(groups.values())) {
            projects.push(new KaggleCloudComputingProject(group, this))
        }

        return projects
    }

    private async getKernelList(): Promise<CloudComputingKernelWithTimestamp[]> {
        const kernelListRequest = new KaggleKernelListRequest()
        kernelListRequest.setGroup("profile")

        // max 100
        const pageAmount = 100
        kernelListRequest.setPageSize(pageAmount)

        let pageNumber = 0
        let resultAmount = 0

        let resultProjects: CloudComputingKernelWithTimestamp[] = []

        do {
            kernelListRequest.setPage(pageNumber)

            const kaggleProjectList = await this.kaggleApi.kernelList(kernelListRequest)
            resultAmount = kaggleProjectList.length

            const projectList = this.transformKernelList(kaggleProjectList)

            resultProjects = resultProjects.concat(projectList)
            pageNumber++
        } while (pageAmount == resultAmount)

        return resultProjects
    }

    private transformKernelList(kaggleProjectList: KaggleKernelListItem[]): CloudComputingKernelWithTimestamp[] {
        const projectList: CloudComputingKernelWithTimestamp[] = []
        for (const kaggleProject of kaggleProjectList) {
            if (KaggleCloudComputingKernelNaming.isMatchingNaming(kaggleProject.ref)) {
                projectList.push({
                    kernel: KaggleCloudComputingKernelNaming.getKernel(kaggleProject.ref),
                    lastRun: kaggleProject.lastRunTime,
                })
            }
        }

        return projectList
    }
}
