import { KaggleCloudComputingKernelNaming } from "../../../../main/api/cloudComputing/kaggle/KaggleCloudComputingKernelNaming"
import { CloudComputingKernel } from "../../../../main/api/cloudComputing/models/CloudComputingKernel"
import { CloudComputingKernelType } from "../../../../main/api/cloudComputing/models/CloudComputingKernelType"

test("getKernelAnalyse", () => {
    const kernel: CloudComputingKernel = KaggleCloudComputingKernelNaming.getKernel(
        "adapterhubuser/ah-firstprogram-a-3-34ff47"
    )
    expect(kernel.name).toEqual("firstprogram")
    expect(kernel.type).toEqual(CloudComputingKernelType.analysis)
    expect(kernel.sheetColumn).toEqual(3)
    expect(kernel.sheetIdHash).toEqual("34ff47")
})

test("getKernelTraining", () => {
    const kernel: CloudComputingKernel = KaggleCloudComputingKernelNaming.getKernel(
        "adapterhubuser/ah-firstprogram-t-45-234234"
    )
    expect(kernel.name).toEqual("firstprogram")
    expect(kernel.type).toEqual(CloudComputingKernelType.training)
    expect(kernel.sheetColumn).toEqual(45)
    expect(kernel.sheetIdHash).toEqual("234234")
})

test("getKernelDash", () => {
    const kernel: CloudComputingKernel = KaggleCloudComputingKernelNaming.getKernel(
        "adapterhubuser/ah-first-program-t-999-394564"
    )
    expect(kernel.name).toEqual("first-program")
    expect(kernel.type).toEqual(CloudComputingKernelType.training)
    expect(kernel.sheetColumn).toEqual(999)
    expect(kernel.sheetIdHash).toEqual("394564")
})

test("isMatchingNamingFalseType", () => {
    const isMatch: boolean = KaggleCloudComputingKernelNaming.isMatchingNaming("adapterhubuser/ah-first-program-3-fffaaa")
    expect(isMatch).toBeFalsy()
})

test("isMatchingNamingFalsePrefix", () => {
    const isMatch: boolean = KaggleCloudComputingKernelNaming.isMatchingNaming("adapterhubuser/first-program-t-3-fffaaa")
    expect(isMatch).toBeFalsy()
})

test("isMatchingNamingTrue", () => {
    const isMatch: boolean = KaggleCloudComputingKernelNaming.isMatchingNaming(
        "adapterhubuser/ah-first-program-t-0-000000"
    )
    expect(isMatch).toBeTruthy()
})

test("getKaggleNameAnalyse", () => {
    const name: string = KaggleCloudComputingKernelNaming.getKaggleName({
        name: "first-program",
        type: CloudComputingKernelType.analysis,
        sheetColumn: 3,
        sheetIdHash: "34ff47",
    })
    expect(name).toEqual("ah-first-program-a-3-34ff47")
})

test("getKaggleNameTraining", () => {
    const name: string = KaggleCloudComputingKernelNaming.getKaggleName({
        name: "first-program",
        type: CloudComputingKernelType.training,
        sheetColumn: 3,
        sheetIdHash: "34ff47",
    })
    expect(name).toEqual("ah-first-program-t-3-34ff47")
})
