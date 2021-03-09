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
    expect(
        apiCall
            .getFiles()[0]
            .url.startsWith(
                "https://www.kaggleusercontent.com/kf/49421924/eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0"
            )
    )
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
