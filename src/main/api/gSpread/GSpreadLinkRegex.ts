import { SpreadSheet } from "../spreadSheet/models/SpreadSheet"

export class GSpreadLinkRegex {
    private static regex = /^(.*)\/spreadsheets\/d\/([a-zA-Z0-9-_]+)(\/(.*))*$/

    public static getSpreadSheet(link: string): SpreadSheet {
        const match: RegExpExecArray | null = this.regex.exec(link)
        if (match) {
            return { id: match[2] }
        }

        throw new Error("name: '" + link + "' does not match regex")
    }

    public static isMatchingRegex(link: string): boolean {
        return this.regex.exec(link) != null
    }
}
