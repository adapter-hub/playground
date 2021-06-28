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
import { User } from "../../services"

const BASE_PATH = "https://www.kaggle.com/api/v1"
export const KaggleApi = {
    kernelList(user: User, listRequest: KaggleKernelListRequest): Promise<KaggleKernelListItem[]> {
        if (user.type !== "kaggle") {
            throw new Error("not a kaggle user")
        }
        return axios
            .get(BASE_PATH + "/kernels/list", {
                auth: { username: user.username, password: user.key },
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

    kernelPush(user: User, pushRequest: KaggleKernelPushRequest): Promise<KaggleKernelPushResponse> {
        if (user.type !== "kaggle") {
            throw new Error("not a kaggle user")
        }
        return axios
            .post(BASE_PATH + "/kernels/push", pushRequest, {
                auth: { username: user.username, password: user.key },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    },

    kernelOutput(user: User, userName: string, kernelSlug: string): Promise<KaggleKernelOutput> {
        if (user.type !== "kaggle") {
            throw new Error("not a kaggle user")
        }
        return axios
            .get(BASE_PATH + "/kernels/output", {
                auth: { username: user.username, password: user.key },
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

    kernelPull(user: User, userName: string, kernelSlug: string): Promise<KaggleKernelPull> {
        if (user.type !== "kaggle") {
            throw new Error("not a kaggle user")
        }
        return axios
            .get(BASE_PATH + "/kernels/pull", {
                auth: { username: user.username, password: user.key },
                params: { userName: userName, kernelSlug: kernelSlug },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    },

    kernelStatus(user: User, username: string, kernelSlug: string): Promise<KaggleKernelStatus> {
        if (user.type !== "kaggle") {
            throw new Error("not a kaggle user")
        }
        return axios
            .get(BASE_PATH + "/kernels/status", {
                auth: { username: user.username, password: user.key },
                params: { userName: username, kernelSlug: kernelSlug },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    },

    uploadFile(
        user: User,
        fileName: string,
        contentLength: number,
        lastModified: number
    ): Promise<KaggleFileUploadToken> {
        if (user.type !== "kaggle") {
            throw new Error("not a kaggle user")
        }
        const formData = new FormData()
        formData.append("fileName", fileName)

        return axios
            .post(`${BASE_PATH}/datasets/upload/file/${contentLength}/${lastModified}`, formData, {
                headers: formData.getHeaders(),
                auth: { username: user.username, password: user.key },
            })
            .then((response) => {
                const data = response.data
                this.checkForError(data)

                return data
            })
    },

    createDataset(user: User, userName: string, datasetSlug: string, fileToken: string): Promise<string> {
        if (user.type !== "kaggle") {
            throw new Error("not a kaggle user")
        }
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
                { auth: { username: user.username, password: user.key } }
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
