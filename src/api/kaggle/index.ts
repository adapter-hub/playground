import axios from "axios"
import { KaggleKernelListRequest } from "./models/KaggleKernelListRequest"
import { KaggleKernelPushRequest } from "./models/KaggleKernelPushRequest"
import { KaggleKernelListItem } from "./models/KaggleKernelListItem"
import { KaggleKernelPushResponse } from "./models/KaggleKernelPushResponse"
import { KaggleKernelStatus } from "./models/KaggleKernelStatus"
import { KaggleKernelOutput } from "./models/KaggleKernelOutput"
import { KaggleKernelPull } from "./models/KaggleKernelPull"
import * as FormData from "form-data"
import { KaggleFileUploadToken } from "./models/KaggleFileUploadToken"

const BASE_PATH = "https://www.kaggle.com/api/v1"
export const KaggleApi = {
    kernelList(credentials: any, listRequest: KaggleKernelListRequest): Promise<KaggleKernelListItem[]> {
        return axios
            .get(BASE_PATH + "/kernels/list", {
                auth: { username: credentials.username, password: credentials.key },
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
    },

    kernelPush(credentials: any, pushRequest: KaggleKernelPushRequest): Promise<KaggleKernelPushResponse> {
        return axios
            .post(BASE_PATH + "/kernels/push", pushRequest, {
                auth: { username: credentials.username, password: credentials.key },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    },

    kernelOutput(credentials: any, userName: string, kernelSlug: string): Promise<KaggleKernelOutput> {
        return axios
            .get(BASE_PATH + "/kernels/output", {
                auth: { username: credentials.username, password: credentials.key },
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
    },

    kernelPull(credentials: any, userName: string, kernelSlug: string): Promise<KaggleKernelPull> {
        return axios
            .get(BASE_PATH + "/kernels/pull", {
                auth: { username: credentials.username, password: credentials.key },
                params: { userName: userName, kernelSlug: kernelSlug },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    },

    kernelStatus(credentials: any, username: string, kernelSlug: string): Promise<KaggleKernelStatus> {
        return axios
            .get(BASE_PATH + "/kernels/status", {
                auth: { username: credentials.username, password: credentials.key },
                params: { userName: username, kernelSlug: kernelSlug },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    },

    uploadFile(
        credentials: any,
        fileName: string,
        contentLength: number,
        lastModified: number
    ): Promise<KaggleFileUploadToken> {
        const formData = new FormData()
        formData.append("fileName", fileName)

        return axios
            .post(`${BASE_PATH}/datasets/upload/file/${contentLength}/${lastModified}`, formData, {
                headers: formData.getHeaders(),
                auth: { username: credentials.username, password: credentials.key },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    },

    createDataset(credentials: any, userName: string, datasetSlug: string, fileToken: string): Promise<string> {
        return axios
            .post(
                BASE_PATH + "/datasets/create/new",
                {
                    title: datasetSlug,
                    slug: datasetSlug,
                    ownerSlug: userName,
                    files: [{ token: fileToken }],
                    isPrivate: true,
                },
                { auth: { username: credentials.username, password: credentials.key } }
            )
            .then((response) => {
                const data = response.data
                if (data.status !== "ok" && data.error !== null) {
                    throw data
                }

                return userName + "/" + datasetSlug
            })
    },

    checkForError(data: any) {
        if (data.message !== undefined && data.code !== undefined) {
            throw data
        }
    },
}
