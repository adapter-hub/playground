import { parse } from "papaparse"

export type PermissionResult = {
    hasCorrectPermissions: boolean
    hasFoundSheet: boolean
}

export const GSpread = {
    //TODO: refactor, add support for multiChars: 'AA'

    columnNumberToString(column: number) {
        return String.fromCharCode(65 + column)
    },

    async getColumnCountRatioToFirstColumn(spreadSheetId: string, column: number): Promise<number> {
        const columnString = this.columnNumberToString(column)
        const url =
            "https://docs.google.com/spreadsheets/d/" +
            spreadSheetId +
            "/gviz/tq?tqx=out:csv&range=A2:" +
            columnString +
            "&tq=select%20(count(" +
            columnString +
            ")/count(A))"

        const csv = await GSpread.loadCSV(url)
        return parseFloat(csv[1][0])
    },

    async getSpreadSheetAsCSV(spreadSheetId: string, range?: string): Promise<string[][]> {
        let url = "https://docs.google.com/spreadsheets/d/" + spreadSheetId + "/gviz/tq?tqx=out:csv"
        if (range) {
            url += "&range=" + range
        }
        return GSpread.loadCSV(url)
    },

    async loadCSV(url: string) {
        const response = await fetch(url)

        GSpread.isCSVContent(response)

        const data = await response.text()

        return this.parseCSV(data)
    },

    isCSVContent(response: Response) {
        if (!response.headers.get("content-type")?.includes("text/csv")) {
            throw new Error("did not receive csv")
        }
    },

    parseCSV(data: any): string[][] {
        const csv = parse<string>(data, {
            skipEmptyLines: true,
        }).data

        if (csv[0] === undefined) {
            return [csv]
        } else {
            return <string[][]>(<unknown>csv)
        }
    },

    spreadSheetIdToLink(id: string): string {
        return `https://docs.google.com/spreadsheets/d/${id}`
    },
    linkMatchesRegex(link: string): boolean {
        return GSpreadLinkRegex.isMatchingRegex(link)
    },

    linkToSpreadSheet(link: string): string | undefined {
        return GSpreadLinkRegex.getSpreadSheet(link)
    },

    async hasPermissionsForSpreadSheet(spreadSheetId: string): Promise<PermissionResult> {
        try {
            await this.getSpreadSheetAsCSV(spreadSheetId, "A1:A1")
            return { hasCorrectPermissions: true, hasFoundSheet: true }
        } catch (error) {
            if (error.message == "Request failed with status code 404") {
                return { hasCorrectPermissions: false, hasFoundSheet: false }
            } else {
                return { hasCorrectPermissions: false, hasFoundSheet: true }
            }
        }
    }
}

const GSpreadLinkRegex = {
    regex: /^(.*)\/spreadsheets\/d\/([a-zA-Z0-9-_]+)(\/(.*))*$/,
    getSpreadSheet(link: string): string | undefined {
        const match: RegExpExecArray | null = this.regex.exec(link)
        if (match) {
            return match[2]
        } else {
            return undefined
        }
    },
    isMatchingRegex(link: string): boolean {
        return this.regex.exec(link) != null
    }
}