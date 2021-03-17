import { KaggleCloudComputingAPI } from "../../../../main/api/cloudComputing/kaggle/KaggleCloudComputingAPI"
import { CloudComputingAPI } from "../../../../main/api/cloudComputing/CloudComputingAPI"
import { CloudComputingKernel } from "../../../../main/api/cloudComputing/models/CloudComputingKernel"
import { CloudComputingKernelType } from "../../../../main/api/cloudComputing/models/CloudComputingKernelType"

const username = "adapterhubuser"
const apiToken = "10a58241424f03974eec4dcb66a69e55"

test("authorizeCredentials", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, apiToken)
    const apiCall = await cloudComputingAPI.authorizeCredentials()
    expect(apiCall.isAuthorized).toEqual(true)
})

test("authorizeCredentials false username", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI("falseusername", apiToken)
    const apiCall = await cloudComputingAPI.authorizeCredentials()
    expect(apiCall.isAuthorized).toEqual(false)
})

test("authorizeCredentials false apiToken", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, "falseapitoken")
    const apiCall = await cloudComputingAPI.authorizeCredentials()
    expect(apiCall.isAuthorized).toEqual(false)
})

test("getProjectList", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, apiToken)
    const apiCall = await cloudComputingAPI.getProjects()
    expect((await apiCall[0].getKernels()).length).toEqual(2)
    expect((await apiCall[0].getKernels())[0].kernel.name).toEqual("dawg")
})

test("pushKernel", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, apiToken)

    const kernel: CloudComputingKernel = {
        name: "cc-test",
        type: CloudComputingKernelType.training,
        sheetColumn: 0,
        sheetIdHash: "ffffff",
    }
    const apiCall = await cloudComputingAPI.pushKernel(kernel, "print('cc-test')")

    expect(apiCall.hasPushed()).toEqual(true)
    expect(apiCall.getError()).toEqual(null)
})

test("pushKernel file", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, apiToken)

    const kernel: CloudComputingKernel = {
        name: "file-use-test",
        type: CloudComputingKernelType.analysis,
        sheetColumn: 0,
        sheetIdHash: "ffffff",
    }
    const apiCall = await cloudComputingAPI.pushKernel(
        kernel,
        "print('cc-test')",
        "yanikadamson/3606e37d-63ad-4fc3-8d96-a0efc4536cf1"
    )

    expect(apiCall.hasPushed()).toEqual(true)
    expect(apiCall.getError()).toEqual(null)
})

/* Cannot be tested FormData is no nodejs module
test("uploadFile", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, apiToken)

    let progress = 0
    const apiCall = await cloudComputingAPI.uploadFile(new TextEncoder().encode("FILECONTENT-ASDSADASD"), (p) => {
        expect(progress <= p).toBeTruthy()
        expect(p >= 0).toBeTruthy()
        expect(p <= 1).toBeTruthy()

        progress = p
    })
    expect(progress === 1).toBeTruthy()

    expect((<string>apiCall).startsWith("yanikadamson/")).toBeTruthy()
}, 10000)*/

test("getOutputLog", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, apiToken)
    const kernel: CloudComputingKernel = {
        name: "test",
        type: CloudComputingKernelType.analysis,
        sheetColumn: 5,
        sheetIdHash: "22cd60",
    }
    const apiCall = await cloudComputingAPI.getOutput(kernel)
    expect(apiCall.getLog()[0]).toEqual({
        data: "WARNING: Skipping typing as it is not installed.\n",
        stream_name: "stderr",
        time: 3.389979886,
    })
})

test("getOutputFiles", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, apiToken)
    const kernel: CloudComputingKernel = {
        name: "test",
        type: CloudComputingKernelType.analysis,
        sheetColumn: 5,
        sheetIdHash: "22cd60",
    }
    const apiCall = await cloudComputingAPI.getOutput(kernel)
    expect(apiCall.getFiles()[0].fileName).toEqual("metadata.txt")
    expect(apiCall.getFiles()[0].url.startsWith("https://www.kaggleusercontent.com/kf")).toBeTruthy()
})

test("getStatus", async () => {
    const cloudComputingAPI: CloudComputingAPI = new KaggleCloudComputingAPI(username, apiToken)
    const kernel: CloudComputingKernel = {
        name: "test",
        type: CloudComputingKernelType.analysis,
        sheetColumn: 5,
        sheetIdHash: "22cd60",
    }
    const apiCall = await cloudComputingAPI.getStatus(kernel)
    expect(apiCall.getStatus()).toEqual("complete")
    expect(apiCall.getFailureMessage()).toEqual(null)
})
