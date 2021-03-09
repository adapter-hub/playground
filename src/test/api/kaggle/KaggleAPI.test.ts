import { KaggleApi } from "../../../main/api/kaggle/KaggleAPI"
import { KaggleKernelListRequest } from "../../../main/api/kaggle/models/KaggleKernelListRequest"
import { KaggleKernelPushRequest } from "../../../main/api/kaggle/models/KaggleKernelPushRequest"

const username = "adapterhubuser"
const apiToken = "10a58241424f03974eec4dcb66a69e55"

test("/kernels/list", async () => {
    const kaggle: KaggleApi = new KaggleApi(username, apiToken)
    const kernelListRequest = new KaggleKernelListRequest()
    kernelListRequest.setUser("adapterhubuser")
    const apiCall = await kaggle.kernelList(kernelListRequest)
    expect(apiCall[0].author).toEqual("AdapterhubUser")
})

test("/kernels/push", async () => {
    const kaggle: KaggleApi = new KaggleApi(username, apiToken)
    const kernelPushRequest = new KaggleKernelPushRequest(username, "testslug", 'print("testslug")', "python", "script")
    kernelPushRequest.setDatasetDataSources(["adapterhubuser/dalksdlasd"])
    const apiCall = await kaggle.kernelPush(kernelPushRequest)
    expect(apiCall.ref).toEqual("/" + username + "/testslug")
    expect(apiCall.invalidDatasetSources).toEqual(["adapterhubuser/dalksdlasd"])
    expect(apiCall.error).toEqual(null)
})

test("/kernels/output", async () => {
    const kaggle: KaggleApi = new KaggleApi(username, apiToken)
    const apiCall = await kaggle.kernelOutput("adapterhubuser", "helloworld-bp")
    expect(apiCall).toEqual({
        files: [],
        log: [
            {
                "data": "cc-test\n",
                "stream_name": "stdout",
                "time": 0.721452662,
            },
            {
                "data": "/opt/conda/lib/python3.7/site-packages/traitlets/traitlets.py:2561: FutureWarning: --Exporter.preprocessors=[\"nbconvert.preprocessors.ExtractOutputPreprocessor\"] for containers is deprecated in traitlets 5.0. You can pass `--Exporter.preprocessors item` ... multiple times to add items to a list.\n",
                "stream_name": "stderr",
                "time": 3.196238801,
            },
            {
                "data": "  FutureWarning,\n",
                "stream_name": "stderr",
                "time": 3.196286247,
            },
            {
                "data": "[NbConvertApp] Converting notebook __script__.ipynb to html\n",
                "stream_name": "stderr",
                "time": 3.19629625,
            },
            {
                "data": "[NbConvertApp] Writing 272705 bytes to __results__.html\n",
                "stream_name": "stderr",
                "time": 3.847139657,
            },
        ],
        nextPageToken: null,
    })
})

test("/kernels/pull", async () => {
    const kaggle: KaggleApi = new KaggleApi(username, apiToken)
    const apiCall = await kaggle.kernelPull("adapterhubuser", "helloworld-bp")
    expect(apiCall).toEqual({
        blob: {
            kernelType: "script",
            language: "python",
            slug: "helloworld-bp",
            source: "print('cc-test')",
        },
        metadata: {
            author: "AdapterhubUser",
            categoryIds: [],
            competitionDataSources: [],
            datasetDataSources: [],
            enableGpu: true,
            enableInternet: true,
            id: 15415153,
            isPrivate: true,
            kernelDataSources: [],
            kernelType: "script",
            language: "python",
            lastRunTime: "2021-03-09T20:12:46.563Z",
            ref: "adapterhubuser/helloworld-bp",
            slug: "helloworld-bp",
            title: "helloworld-bp",
            totalVotes: 0,
        },
    })
})

test("/kernels/status", async () => {
    const kaggle: KaggleApi = new KaggleApi(username, apiToken)
    const apiCall = await kaggle.kernelStatus("adapterhubuser", "helloworld-bp")
    expect(apiCall.status).toEqual("complete")
    expect(apiCall.failureMessage).toEqual(null)
})
