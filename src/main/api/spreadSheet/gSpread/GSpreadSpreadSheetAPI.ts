import { SpreadSheetAPI } from "../SpreadSheetAPI"
import { SpreadSheet } from "../models/SpreadSheet"
import { PermissionResult } from "../models/PermissionResult"
import { GSpreadLinkRegex } from "../../gSpread/GSpreadLinkRegex"
import { GSpreadAPI } from "../../gSpread/GSpreadAPI"

export class GSpreadSpreadSheetAPI implements SpreadSheetAPI {
    private gSpread: GSpreadAPI

    constructor() {
        this.gSpread = new GSpreadAPI()
    }

    linkMatchesRegex(link: string): boolean {
        return GSpreadLinkRegex.isMatchingRegex(link)
    }

    linkToSpreadSheet(link: string): SpreadSheet {
        return GSpreadLinkRegex.getSpreadSheet(link)
    }

    async hasPermissionsForSpreadSheet(spreadSheet: SpreadSheet): Promise<PermissionResult> {
        try {
            await this.getSpreadSheetAsCSV(spreadSheet, "A1:A1")
            return { hasCorrectPermissions: true, hasFoundSheet: true }
        } catch (error) {
            if (error.message == "Request failed with status code 404") {
                return { hasCorrectPermissions: false, hasFoundSheet: false }
            } else {
                return { hasCorrectPermissions: false, hasFoundSheet: true }
            }
        }
    }

    getSpreadSheetAsCSV(spreadSheet: SpreadSheet, range?: string): Promise<string[][]> {
        return this.gSpread.getSpreadSheetAsCSV(spreadSheet, range)
    }

    getColumnCountRatioToFirstColumn(spreadSheet: SpreadSheet, column: number): Promise<number> {
        return this.getColumnCountRatioToFirstColumn(spreadSheet, column)
    }
}
