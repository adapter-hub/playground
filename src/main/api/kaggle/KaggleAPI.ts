import axios from "axios"
import { KaggleKernelListRequest } from "./models/KaggleKernelListRequest"
import { KaggleKernelPushRequest } from "./models/KaggleKernelPushRequest"
import { KaggleKernelListItem } from "./models/KaggleKernelListItem"
import { KaggleKernelPushResponse } from "./models/KaggleKernelPushResponse"
import { KaggleKernelStatus } from "./models/KaggleKernelStatus"
import { KaggleKernelOutput } from "./models/KaggleKernelOutput"
import { KaggleKernelPull } from "./models/KaggleKernelPull"
import { addCorsProxy } from "../../toolbox"
import { KaggleInputFile } from "./models/KaggleInputFile"
import { KaggleFileUploadToken } from "./models/KaggleFileUploadToken"

export class KaggleApi {
    BASE_PATH = "https://www.kaggle.com/api/v1"

    private userName: string
    private apiToken: string

    constructor(userName: string, apiToken: string) {
        this.userName = userName
        this.apiToken = apiToken
    }

    public kernelList(listRequest: KaggleKernelListRequest): Promise<KaggleKernelListItem[]> {
        return axios
            .get(addCorsProxy(this.BASE_PATH + "/kernels/list"), {
                auth: { username: this.userName, password: this.apiToken },
                params: listRequest,
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                const result: KaggleKernelListItem[] = []

                for (const item of data) {
                    result.push(
                        new KaggleKernelListItem(item.ref, item.title, item.author, item.lastRunTime, item.totalVotes)
                    )
                }

                return result
            })
    }

    public kernelPush(pushRequest: KaggleKernelPushRequest): Promise<KaggleKernelPushResponse> {
        return axios
            .post(addCorsProxy(this.BASE_PATH + "/kernels/push"), pushRequest, {
                auth: { username: this.userName, password: this.apiToken },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    }

    public kernelOutput(userName: string, kernelSlug: string): Promise<KaggleKernelOutput> {
        return axios
            .get(addCorsProxy(this.BASE_PATH + "/kernels/output"), {
                auth: { username: this.userName, password: this.apiToken },
                params: { userName: userName, kernelSlug: kernelSlug },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                if (data.log !== "") {
                    data.log = JSON.parse(data.log)
                }

                return data
            })
    }

    public kernelPull(userName: string, kernelSlug: string): Promise<KaggleKernelPull> {
        return axios
            .get(addCorsProxy(this.BASE_PATH + "/kernels/pull"), {
                auth: { username: this.userName, password: this.apiToken },
                params: { userName: userName, kernelSlug: kernelSlug },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    }

    public kernelStatus(userName: string, kernelSlug: string): Promise<KaggleKernelStatus> {
        return axios
            .get(addCorsProxy(this.BASE_PATH + "/kernels/status"), {
                auth: { username: this.userName, password: this.apiToken },
                params: { userName: userName, kernelSlug: kernelSlug },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    }

    public uploadFile(file: KaggleInputFile): Promise<KaggleFileUploadToken> {
        const formData = new FormData()
        formData.append("fileName", file.fileName)

        return axios
            .post(
                addCorsProxy(this.BASE_PATH + "/datasets/upload/file/" + file.contentLength + "/" + file.lastModified),
                formData,
                {
                    auth: { username: this.userName, password: this.apiToken },
                }
            )
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    }

    public createDataset(userName: string, datasetSlug: string, fileToken: string): Promise<string> {
        return axios
            .post(
                addCorsProxy(this.BASE_PATH + "/datasets/create/new"),
                {
                    title: datasetSlug,
                    slug: datasetSlug,
                    ownerSlug: userName,
                    files: [{ token: fileToken }],
                    isPrivate: true,
                },
                { auth: { username: this.userName, password: this.apiToken } }
            )
            .then((response) => {
                const data = response.data
                if (data.status !== "ok" && data.error !== null) {
                    throw data
                }

                return userName + "/" + datasetSlug
            })
    }

    private checkForError(data: any) {
        if (data.message !== undefined && data.code !== undefined) {
            throw data
        }
    }
}
