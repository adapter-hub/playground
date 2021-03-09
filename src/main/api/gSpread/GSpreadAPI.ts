import axios, { AxiosResponse } from "axios"
import { SpreadSheet } from "../spreadSheet/models/SpreadSheet"
import { parse } from "papaparse"

export class GSpreadAPI {
    //TODO: refactor, add support for multiChars: 'AA'
    private columnNumberToString(column: number) {
        return String.fromCharCode(65 + column)
    }

    public getColumnCountRatioToFirstColumn(spreadSheet: SpreadSheet, column: number): Promise<number> {
        const columnString = this.columnNumberToString(column)
        const url =
            "https://docs.google.com/spreadsheets/d/" +
            spreadSheet.id +
            "/gviz/tq?tqx=out:csv&range=A2:" +
            columnString +
            "&tq=select%20(count(" +
            columnString +
            ")/count(A))"

        return axios.get(url).then((res) => {
            this.isCSVContent(res)

            if (res.data instanceof Object) {
                // Invalid query: NO_COLUMN
                // Column is empty / out of bounds
                return 0
            } else {
                const csv = this.parseCSV(res.data)
                return parseFloat(csv[1][0])
            }
        })
    }

    public getSpreadSheetAsCSV(spreadSheet: SpreadSheet, range?: string): Promise<string[][]> {
        let url = "https://docs.google.com/spreadsheets/d/" + spreadSheet.id + "/gviz/tq?tqx=out:csv"
        if (range) {
            url += "&range=" + range
        }

        return axios.get(url).then((res) => {
            if (!res.headers["content-type"].includes("text/csv")) {
                throw new Error("did not receive csv")
            }

            return this.parseCSV(res.data)
        })
    }

    private isCSVContent(response: AxiosResponse<any>) {
        if (!response.headers["content-type"].includes("text/csv")) {
            throw new Error("did not receive csv")
        }
    }

    private parseCSV(data: any): string[][] {
        const csv = parse<string>(data, {
            skipEmptyLines: true,
        }).data

        if (csv[0] === undefined) {
            return [csv]
        } else {
            return <string[][]>(<unknown>csv)
        }
    }
}
