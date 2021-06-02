export class DateParser {
    private regexDate = /^(\d{2})\.(\d{2})\.(\d{4})$/
    private regexDateTime = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/

    public parse(s: string): number {
        const jsDate = this.parseJS(s)
        if (!isNaN(jsDate)) {
            return jsDate
        }

        const googleDate = this.parseGoogleDate(s)
        if (!isNaN(googleDate)) {
            return googleDate
        }

        const googleDateTime = this.parseGoogleDateTime(s)
        if (!isNaN(googleDateTime)) {
            return googleDateTime
        }

        console.error("Unsupported date format: '" + s + "'")
        return NaN
    }

    private parseJS(s: string): number {
        return Date.parse(s)
    }

    private parseGoogleDate(s: string): number {
        const regArray = this.regexDate.exec(s)

        if (regArray == null) {
            return NaN
        }

        const date = `${regArray[3]}-${regArray[2]}-${regArray[1]}`
        return this.parseJS(date)
    }

    private parseGoogleDateTime(s: string): number {
        const regArray = this.regexDateTime.exec(s)

        if (regArray == null) {
            return NaN
        }

        const date = `${regArray[3]}-${regArray[2]}-${regArray[1]}` + ` ${regArray[4]}:${regArray[5]}:${regArray[6]}`
        return this.parseJS(date)
    }
}
