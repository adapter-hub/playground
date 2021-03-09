import { min } from "rxjs/operators"
import { Row, Timeintervall } from "./visualization-result-panel"

function filterString(val: any): val is string {
    return typeof val === "string"
}

export function prepareData(nameOfRows: Array<string>, rows: Array<Row>) {
    let lowestdate: Date | null = null
    let highestdate: Date | null = null

    const allTypes = new Map<string, Array<string | Date>>()

    for (const line of rows) {
        for (let columnIndex = 2; columnIndex < line.length; columnIndex++) {
            const typeAtColumn: string = line[columnIndex][0]
            const nameOfColumn: string = getRowNameFromIndex(columnIndex, nameOfRows)
            if (typeAtColumn != null && typeAtColumn.length > 0) {
                if (nameOfColumn != "date") {
                    if (allTypes.get(nameOfColumn)?.some((e) => e == typeAtColumn)) {
                        //do nothing
                    } else {
                        if (!allTypes.has(nameOfColumn)) {
                            allTypes.set(nameOfColumn, [typeAtColumn])
                        } else {
                            allTypes.get(nameOfColumn)?.push(typeAtColumn)
                        }
                    }
                } else {
                    if (!isNaN(Date.parse(line[getIndexFromRowName("date", nameOfRows)][0]))) {
                        const DateInLine: Date = new Date(Date.parse(line[getIndexFromRowName("date", nameOfRows)][0]))
                        lowestdate == null
                            ? (lowestdate = DateInLine)
                            : lowestdate > DateInLine
                            ? (lowestdate = DateInLine)
                            : null
                        highestdate == null
                            ? (highestdate = DateInLine)
                            : highestdate < DateInLine
                            ? (highestdate = DateInLine)
                            : null
                    }
                }
                //idee wäre hier noch, eine else if für intervalle einzubauen. sprich der user merkt in google docs an, dass eine spalte
                // viele, sortierbare werte (zahlen hat). dann teilen wir die werte in intervalle ein, statt jeden wert einzeln zu nehmen
                // wenn es z.B. den Wert Körpergröße gibt, machen wir im moment: lauf1_negative_x_größe_160, lauf1_negative_x_größe_161
                //  lauf1_negative_x_größe_162,lauf1_negative_x_größe_163, lauf1_negative_x_größe_164,lauf1_negative_x_größe_165 usw usw.
                // sinnvoll wäre, wenn wir gleich irgendwie lauf1_negative_x_größe_160-170 lauf1_negative_x_größe_160-180  lauf1_negative_x_größe_160-190
                // anbieten. Dann explodiert die "Add Lines" Spalte nicht so. können wir bei der nächsten besprechung mal vorschlagen
            }
        }
    }

    const listOfAllLabelNames = Array.from(allTypes.entries())
        .map(([nameOfColumn, typesAtColumn]) =>
            typesAtColumn
                .filter(filterString)
                .map((typeAtColumn) => getListOfLabelNames(typeAtColumn, nameOfColumn, allTypes))
                .reduce((v1, v2) => v1.concat(v2), [])
        )
        .reduce((v1, v2) => v1.concat(v2), [])
        .filter(function (item, pos, self) {
            return self.indexOf(item) == pos
        })

    const nameOfOutputLines = Array.from(allTypes.entries())
        .map(([nameOfColumn, typesAtColumn]) => typesAtColumn.map((typeAtColumn) => nameOfColumn + "_" + typeAtColumn))
        .reduce((v1, v2) => v1.concat(v2), [])

    if (highestdate != null && lowestdate != null && highestdate != lowestdate) {
        allTypes.set("dates_year", [lowestdate, highestdate])
        allTypes.set("dates_month", [lowestdate, highestdate])
        allTypes.set("dates_day", [lowestdate, highestdate])
    }

    const listGroupBy = Array.from(allTypes.keys())
    return {
        listOfAllLabelNames,
        listGroupBy,
        nameOfRows,
        allTypes,
    }
}

function getListOfLabelNames(typeatcolumn: string, nameofcolumn: string, allTypes: Map<string, Array<string | Date>>) {
    const fullName = nameofcolumn + "_" + typeatcolumn
    return [
        ...Array.from(allTypes.entries())
            .filter(([key]) => key != nameofcolumn && !key.includes("dates_"))
            .map(([key, value]) => value.filter(filterString).map((e) => [fullName, key + "_" + e].sort().join("_x_")))
            .reduce((v1, v2) => v1.concat(v2), []),
        fullName,
    ]
}

function groupByDate(
    groupb: string,
    rows: Array<Row>,
    allTypes: Map<string, Array<string | Date>>,
    nameOfRows: Array<string>,
    listOfAllLabelNames: Array<string>,
    minConfidenz: number
): Array<any> {
    const tabledata: any[] = new Array<any>()
    const datesarray: Array<string | Date> | undefined = allTypes.get(groupb)
    if (datesarray != null) {
        if (datesarray[0] instanceof Date && datesarray[1] instanceof Date) {
            const intervall: Timeintervall =
                "dates_year" == groupb
                    ? Timeintervall.Year
                    : "dates_month" == groupb
                    ? Timeintervall.Month
                    : Timeintervall.Day
            let LowestDate: Date = returnRoundOffDatePerIntervall(intervall, datesarray[0])
            const HighestDate: Date = returnRoundOffDatePerIntervall(intervall, datesarray[1])
            let DataPerDate: any = {}
            for (const line of rows) {
                const LineDate: Date = new Date(Date.parse(line[getIndexFromRowName("date", nameOfRows)][0]))
                const RoundedLineDate: string = returnRoundOffDatePerIntervall(intervall, LineDate).toString()
                if (DataPerDate[RoundedLineDate] == null) {
                    DataPerDate[RoundedLineDate] = {}
                }

                for (let RowsIndex = 0; RowsIndex < line.length; RowsIndex++) {
                    if (RowsIndex != getIndexFromRowName("date", nameOfRows) && line[RowsIndex][1] > minConfidenz) {
                        DataPerDate = insertDataCellIntoObject(
                            RowsIndex,
                            DataPerDate,
                            line,
                            RoundedLineDate,
                            nameOfRows
                        )
                    }
                }
            }
            while (LowestDate <= HighestDate) {
                let chartline: any[] = new Array<any>()
                listOfAllLabelNames.map((label) => {
                    chartline = { ...chartline, [label]: 0 }
                })
                if (DataPerDate[LowestDate.toString()] != null) {
                    Object.keys(chartline).map(function (key: any) {
                        chartline[key] =
                            DataPerDate[LowestDate.toString()][key] != null
                                ? DataPerDate[LowestDate.toString()][key]
                                : 0
                    })
                }
                tabledata.push({
                    [groupb]: LowestDate.getFullYear() + "/" + LowestDate.getMonth() + "/" + LowestDate.getDate(),
                    Date: LowestDate,
                    ...chartline,
                })
                LowestDate = setDate(intervall, LowestDate, 1)
            }
        }
    }
    return tabledata
}

function groupByRow(
    groupb: string,
    rows: Array<Row>,
    allTypes: Map<string, Array<string | Date>>,
    nameOfRows: Array<string>,
    listOfallLabelNames: Array<string>,
    minConfidenz: number
): Array<any> {
    const indexOfRow: number = getIndexFromRowName(groupb, nameOfRows)

    return (
        allTypes.get(groupb)?.map((typename) => {
            const dataOfCertainType = rows.filter((line) => {
                return line[indexOfRow][0] == typename
            })
            let chartlines: { [label: string]: number } = {}
            listOfallLabelNames.map((label) => {
                chartlines = { ...chartlines, [label]: 0 }
            })
            dataOfCertainType.forEach((lines) => {
                for (let columnIndex = 2; columnIndex < lines.length; columnIndex++) {
                    if (lines[columnIndex][1] < minConfidenz) {
                        continue
                    }
                    const singlename: string =
                        getRowNameFromIndex(columnIndex, nameOfRows) + "_" + lines[columnIndex][0]
                    // lines[1]row regexen=> confidence bestimmen, wenn < ConfidenceRange, dann bis nächster kommentar springen
                    if (chartlines[singlename] != null) {
                        chartlines[singlename]++
                    }
                    for (let missingrows: number = columnIndex + 1; missingrows < lines[1].length; missingrows++) {
                        const crossproductname: string[] = [
                            singlename,
                            getRowNameFromIndex(missingrows, nameOfRows) + "_" + lines[1][missingrows],
                        ].sort()
                        const crossname: string = crossproductname[0] + "_x_" + crossproductname[1]
                        if (chartlines[crossname] != null) {
                            chartlines[crossname]++
                        }
                    }
                }
            })

            return {
                [groupb]: `${groupb}_${typename}`,
                ...chartlines,
            }
        }) ?? []
    )
}

export function computeChartData(
    groupb: string,
    rows: Array<Row>,
    allTypes: Map<string, Array<string | Date>>,
    nameOfRows: Array<string>,
    listOfAllLabelNames: Array<string>,
    minConfidenz: number
) {
    if (groupb.includes("dates_")) {
        return groupByDate(groupb, rows, allTypes, nameOfRows, listOfAllLabelNames, minConfidenz)
    } else {
        return groupByRow(groupb, rows, allTypes, nameOfRows, listOfAllLabelNames, minConfidenz)
    }
}

function returnRoundOffDatePerIntervall(intervall: Timeintervall, date: Date): Date {
    switch (intervall) {
        case Timeintervall.Year: {
            return new Date(date.getFullYear(), 0)
        }
        case Timeintervall.Month: {
            return new Date(date.getFullYear(), date.getMonth())
        }
        case Timeintervall.Day: {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate())
        }
        default: {
            return date
        }
    }
}

function getIndexFromRowName(name: string, nameOfRows: Array<string>): number {
    return nameOfRows.findIndex((nameOfRow) => nameOfRow === name)
}
function getRowNameFromIndex(index: number, nameOfRows: Array<string>): string {
    return nameOfRows[index] ?? ""
}

function insertDataCellIntoObject(
    RowsIndex: number,
    DataPerDate: any,
    line: Row,
    RoundedLineDate: string,
    nameOfRows: Array<string>
) {
    const singlename: string = getRowNameFromIndex(RowsIndex, nameOfRows) + "_" + line[RowsIndex][0]

    if (DataPerDate[RoundedLineDate][singlename] == null) {
        DataPerDate[RoundedLineDate][singlename] = 1
    } else {
        DataPerDate[RoundedLineDate][singlename]++
    }

    for (let missingrows: number = RowsIndex + 1; missingrows < line.length; missingrows++) {
        if (RowsIndex != getIndexFromRowName("date", nameOfRows)) {
            const crossproductname: string[] = [
                singlename,
                getRowNameFromIndex(missingrows, nameOfRows) + "_" + line[missingrows][0],
            ].sort()

            const crossname: string = crossproductname[0] + "_x_" + crossproductname[1]
            if (DataPerDate[RoundedLineDate][crossname] == null) {
                DataPerDate[RoundedLineDate][crossname] = 1
            } else {
                DataPerDate[RoundedLineDate][crossname] = DataPerDate[RoundedLineDate][crossname] + 1
            }
        }
    }
    return DataPerDate
}

//returns new date as number
function setDate(intervall: Timeintervall, date: Date, timevalue: number): Date {
    switch (intervall) {
        case Timeintervall.Year: {
            return new Date(date.getFullYear() + timevalue, 0)
        }
        case Timeintervall.Month: {
            return new Date(date.getFullYear(), date.getMonth() + timevalue)
        }
        case Timeintervall.Day: {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + timevalue)
        }
        default: {
            return new Date()
        }
    }
}
