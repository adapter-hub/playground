import { CloudComputingKernel } from "../models/CloudComputingKernel"
import { CloudComputingKernelType } from "../models/CloudComputingKernelType"

export class KaggleCloudComputingKernelNaming {
    private static regex = /^(.*)\/ah-(.*)-(a|t)-(\d+)-([0-9a-f]{6})$/

    public static getKernel(kaggleName: string): CloudComputingKernel {
        const match: RegExpExecArray | null = this.regex.exec(kaggleName)
        if (match) {
            const type = this.kaggleNamingToType(match[3])

            return { name: match[2], type: type, sheetColumn: parseInt(match[4]), sheetIdHash: match[5] }
        }

        throw new Error("name: '" + kaggleName + "' does not match regex")
    }

    public static isMatchingNaming(kaggleName: string): boolean {
        return this.regex.exec(kaggleName) != null
    }

    public static getKaggleName(kernel: CloudComputingKernel): string {
        return (
            "ah-" +
            kernel.name +
            "-" +
            this.typeToKaggleNaming(kernel.type) +
            "-" +
            kernel.sheetColumn +
            "-" +
            kernel.sheetIdHash
        )
    }

    public static typeToKaggleNaming(type: CloudComputingKernelType): string {
        switch (type) {
            case CloudComputingKernelType.analysis:
                return "a"
            case CloudComputingKernelType.training:
                return "t"
        }
    }

    public static kaggleNamingToType(type: string): CloudComputingKernelType {
        switch (type) {
            case "a":
                return CloudComputingKernelType.analysis
            case "t":
                return CloudComputingKernelType.training
        }

        throw new Error("not matching enum")
    }
}
