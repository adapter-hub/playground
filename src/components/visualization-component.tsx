import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LoadingComponent } from "./loading-component"
import Charts from "./charts"
import { computeChartData, prepareData } from "./data-preparation"
import MultiSelect from "react-multi-select-component"
import { PredictionExplanation } from "./prediction-explanation"
import { Form } from "react-bootstrap"
import { GSpread } from "../api/gspread"
import domtoimage from "dom-to-image"
import { toast } from "react-toastify"
import { InfoComponent } from "./info-component"

export enum VisualizationType {
    BarChart,
    LineChart,
    AreaChart,
    PercentageAreaChart,
    CardinaleAreaChart,
}
export enum Timeintervall {
    Year,
    Month,
    Day,
}

const Chart = [
    { value: VisualizationType.BarChart, label: "BarChart" },
    { value: VisualizationType.LineChart, label: "LineChart" },
    { value: VisualizationType.AreaChart, label: "AreaChart" },
    { value: VisualizationType.PercentageAreaChart, label: "PercentageAreaChart" },
    { value: VisualizationType.CardinaleAreaChart, label: "CardinaleAreaChart" },
]

export type Row = Array<[string, number]>

const ConfidenzRegex = /^(.*),(\d+(\.\d+)?)$/

export function toRow(data: Array<string>): Row {
    return data.map<[string, number]>((rawCell) => {
        const match = ConfidenzRegex.exec(rawCell)
        if (match == null) {
            return [rawCell, 1]
        } else {
            return [match[1], parseFloat(match[2])]
        }
    })
}

export function VisualizationComponent({
    googleSheetId,
    reloadRef,
}: {
    googleSheetId: string
    reloadRef: MutableRefObject<(() => void) | undefined>
}) {
    const [{ loading, results }, setResultState] = useState<{
        loading: boolean
        results: Array<Array<string>> | undefined
    }>({
        results: undefined,
        loading: true,
    })

    const reloadData = useCallback(() => {
        GSpread.getSpreadSheetAsCSV(googleSheetId)
            .then((results) =>
                setResultState({
                    loading: false,
                    results,
                })
            )
            .catch((error) => toast.error(error.message))
    }, [googleSheetId, setResultState])

    useEffect(() => (reloadRef.current = reloadData), [reloadData])

    useEffect(() => {
        reloadData()
    }, [googleSheetId])

    const nameOfRows = useMemo(() => (results == null ? [] : results[0] ?? []), [results])
    const rows = useMemo(() => (results == null ? [] : results.slice(1).map(toRow)), [results])
    const [showExplanation, setShowExplanation] = useState(false)

    const { allTypes, listOfAllLabelNames, listGroupBy } = useMemo(
        () => prepareData(nameOfRows, rows),
        [nameOfRows, rows]
    )

    return (
        <div className="mb-3">
            <div className="d-flex flex-row align-items-center">
                <h1 className="m-0">Results</h1>
                <button onClick={() => reloadData()} className="btn ml-3 btn-outline-primary">
                    Reload
                </button>
            </div>
            <div className="d-flex flex-column">
                {loading ? (
                    <LoadingComponent>Retrieving Results</LoadingComponent>
                ) : results == null ? (
                    "Error while loading the result"
                ) : allTypes == null || listOfAllLabelNames == null || listGroupBy == null ? (
                    <div className="p-2">
                        <div className="d-flex justify-content-xl-start p-2" style={{ fontSize: "1.3rem" }}>
                            Could not process your google sheet, so please make sure it is formatted correctly. Often
                            the timestamps are wrongly formatted (note that we support 06/24/2016 but not
                            24/06/2016).Check the faq page for more help.
                        </div>
                        <div className="d-flex justify-content-xl-start p-2">
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => setShowExplanation(!showExplanation)}>
                                {showExplanation ? "Hide Example" : "Show Example"}
                            </button>
                        </div>
                        {showExplanation && <PredictionExplanation />}
                    </div>
                ) : (
                    <VisualizationResultPage
                        allTypes={allTypes}
                        listOfAllLabelNames={listOfAllLabelNames}
                        listGroupBy={listGroupBy}
                        nameOfRows={nameOfRows}
                        rows={rows}></VisualizationResultPage>
                )}
            </div>
        </div>
    )
}

export function VisualizationResultPage({
    allTypes,
    listOfAllLabelNames,
    listGroupBy,
    nameOfRows,
    rows,
}: {
    allTypes: Map<string, (string | Date)[]>
    listOfAllLabelNames: string[]
    listGroupBy: string[]
    nameOfRows: string[]
    rows: Row[]
}) {
    const [visualizationType, setVisualizationType] = useState<VisualizationType>(VisualizationType.PercentageAreaChart)

    const [selected, setSelected] = useState<
        {
            label: string
            value: string
        }[]
    >([])

    const [groupedBy, setGroupBy] = useState<string | undefined>(undefined)

    const [minConfidenz, setMinConfidenz] = useState(0)

    const chartData = useMemo(
        () =>
            groupedBy != null
                ? computeChartData(groupedBy, rows, allTypes, nameOfRows, listOfAllLabelNames, minConfidenz)
                : groupedBy,
        [groupedBy, allTypes, nameOfRows, listOfAllLabelNames, rows, minConfidenz]
    )

    useEffect(() => {
        if (groupedBy == null && listGroupBy.length > 0) {
            setGroupBy(listGroupBy[0])
        }
    }, [groupedBy, listGroupBy])

    const chartRef = useRef(null)

    const handleDownload = useCallback(() => {
        const chart = chartRef.current
        if (chart != null) {
            domtoimage.toJpeg(chart, { bgcolor: "white" }).then((url) => {
                const a = document.createElement("a")
                document.body.appendChild(a)
                a.download = "chart.jpg"
                a.href = url
                a.click()
                document.body.removeChild(a)
            })
        }
    }, [chartRef])

    const groupByOptions = useMemo(
        () =>
            listGroupBy.map((groupBy, index) => (
                <option key={index} value={groupBy}>
                    {groupBy}
                </option>
            )),
        [listGroupBy]
    )

    const visibleClassesOptions = useMemo(
        () =>
            listOfAllLabelNames
                //TODO: testing via include is bad practise since one task name could include another task name (in general the data preparation should be redone and the combined classes should not be concatenated)
                .filter((label) => groupedBy == null || !label.includes(groupedBy))
                .sort((a, b) => (a.length > b.length ? 1 : -1))
                .map((name) => {
                    return {
                        label: name,
                        value: name,
                    }
                }),
        [listOfAllLabelNames, groupedBy]
    )

    const currentChartName = useMemo(() => getChartName(visualizationType), [visualizationType])

    const linesInChart = useCallback(() => {
        const chartArray: string[] = []
        Object.values(selected).forEach((e) => {
            chartArray.push(e.value)
        })
        return chartArray
    }, [selected])

    return (
        <div>
            <div className="d-flex flex-column justify-content-center mb-5">
                <div className="mt-3">Select Chart</div>
                <Form.Group>
                    <Form.Label>Custom select</Form.Label>
                    <Form.Control
                        placeholder="Select Chart"
                        onChange={(e) => {
                            setVisualizationType(parseInt(e.currentTarget.value))
                        }}
                        value={visualizationType}
                        as="select"
                        custom>
                        {Chart.map((chart, index) => (
                            <option key={index} value={chart.value}>
                                {chart.label}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <div className="mt-3">
                    Min. Classfication Confidence
                    <InfoComponent text="Any value of one input that is less than the minimum confidence is excluded from the graph." />
                </div>
                <input
                    className="form-control"
                    defaultValue={0}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val)) {
                            setMinConfidenz(val)
                        }
                    }}
                />
                <Form.Group>
                    <Form.Label>Group By</Form.Label>
                    <Form.Control
                        placeholder="Group By"
                        onChange={(e) => setGroupBy(e.currentTarget.value as any)}
                        value={groupedBy}
                        as="select"
                        custom>
                        {groupByOptions}
                    </Form.Control>
                </Form.Group>
                <div className="mt-3">Visible Classes</div>
                <MultiSelect
                    onChange={setSelected}
                    value={selected}
                    options={visibleClassesOptions}
                    labelledBy={"Select"}
                />
            </div>
            <h2 style={{ textAlign: "center" }}>{currentChartName}</h2>
            <div ref={chartRef} className="d-flex justify-content-center mb-5">
                <Charts
                    currentlygroupedby={groupedBy ?? ""}
                    visibleOutputLines={linesInChart()}
                    data={chartData}
                    visualizationType={visualizationType}
                />
            </div>
            <button className="btn btn-primary mb-5" onClick={handleDownload}>
                Export Image
            </button>
        </div>
    )
}

function getChartName(visualizationType: VisualizationType) {
    switch (visualizationType) {
        case VisualizationType.AreaChart:
            return "AreaChart"
        case VisualizationType.BarChart:
            return "BarChart"
        case VisualizationType.CardinaleAreaChart:
            return "Cardinale AreaChart"
        case VisualizationType.LineChart:
            return "LineChart"
        case VisualizationType.PercentageAreaChart:
            return "Percentage AreaChart"
    }
}
