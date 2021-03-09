import { PermissionResult } from "./models/PermissionResult"
import { SpreadSheet } from "./models/SpreadSheet"

export interface SpreadSheetAPI {
    /**
     * Returns if link matches the regex expression
     * @param link to spreadsheet
     */
    linkMatchesRegex(link: string): boolean

    /**
     * Returns a SpreadSheet from link
     * @param link to spreadsheet
     */
    linkToSpreadSheet(link: string): SpreadSheet

    /**
     * Returns permissions for the spreadsheet
     * @param spreadSheet
     */
    hasPermissionsForSpreadSheet(spreadSheet: SpreadSheet): Promise<PermissionResult>

    /**
     * Returns csv of the spreadsheet
     * @param spreadSheet
     */
    getSpreadSheetAsCSV(spreadSheet: SpreadSheet, range?: string): Promise<string[][]>

    /**
     * Returns the ratio 'column'/A, the count of entries in 'column' to the count the entries in A
     * @param spreadSheet
     */
    getColumnCountRatioToFirstColumn(spreadSheet: SpreadSheet, column: number): Promise<number>
}
