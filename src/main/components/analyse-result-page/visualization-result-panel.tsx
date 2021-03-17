import FileSaver from "file-saver"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Loading from "../loading/loading"
import domtoimage from "dom-to-image"
import Select from "react-select"
import "bootstrap/dist/css/bootstrap.css"
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css"
import Charts from "./charts"
import { computeChartData, prepareData } from "./data-preparation"
import MultiSelect from "react-multi-select-component"
import ReactTooltip from "react-tooltip"
import { AnalysisExplanation } from "../task-configuration-page/analysis-explanation"

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

const selectGroupBy = [
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

export function RenderVisualization({ response, loading }: { response: string[][] | undefined; loading: boolean }) {
    const nameOfRows = useMemo(() => (response == null ? [] : response[0] ?? []), [response])
    const rows = useMemo(() => (response == null ? [] : response.slice(1).map(toRow)), [response])
    const [showExplanation, setShowExplanation] = useState(false)

    const { allTypes, listOfAllLabelNames, listGroupBy } = useMemo(() => prepareData(nameOfRows, rows), [
        nameOfRows,
        rows,
    ])
    return (
        <div>
            <div className="d-flex flex-column">
                {loading ? (
                    <Loading>Retrieving Results</Loading>
                ) : response == null ? (
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
                        {showExplanation && <AnalysisExplanation />}
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

    const [currentlyGroupedBy, setCurrentlyGroupedBy] = useState<string | undefined>(undefined)

    const [minConfidenz, setMinConfidenz] = useState(0)

    const chartData = useMemo(
        () =>
            currentlyGroupedBy != null
                ? computeChartData(currentlyGroupedBy, rows, allTypes, nameOfRows, listOfAllLabelNames, minConfidenz)
                : currentlyGroupedBy,
        [currentlyGroupedBy, allTypes, nameOfRows, listOfAllLabelNames, rows, minConfidenz]
    )
    const chartContainerRef = useRef(null)

    useEffect(() => {
        if (currentlyGroupedBy == null && listGroupBy.length > 0) {
            setCurrentlyGroupedBy(listGroupBy[0])
        }
    }, [currentlyGroupedBy, listGroupBy])

    useEffect(() => {
        ReactTooltip.rebuild()
    }, [])

    const handleDownload = useCallback(() => {
        const node = chartContainerRef.current
        if (node != null) {
            domtoimage.toBlob(node, { bgcolor: "white" }).then(function (blob) {
                FileSaver.saveAs(blob, "my-node.png")
            })
        }
    }, [chartContainerRef])

    const allLinesForSelect = useCallback(() => {
        return listOfAllLabelNames
            .map((name) => {
                return {
                    label: name,
                    value: name,
                }
            })
            .sort((a, b) => (a.value.length > b.value.length ? 1 : -1))
    }, [listOfAllLabelNames, selected])

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
                <Select
                    onChange={(e) => {
                        e?.value != null ? setVisualizationType(e?.value) : null
                    }}
                    value={
                        visualizationType != null
                            ? { label: getChartName(visualizationType), value: visualizationType }
                            : null
                    }
                    options={selectGroupBy}
                    width="10px"
                    placeholder={"Select Chart"}
                />
                <div className="mt-3">
                    Min. Classfication Confidence{" "}
                    <i
                        className="fas fa-info-circle text-primary ml-2"
                        data-for="main"
                        data-tip="Any value of one input that is less than the minimum confidence is excluded from the graph."
                    />
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
                <div className="mt-3">Group By</div>
                <Select
                    onChange={(e) => {
                        e != null ? setCurrentlyGroupedBy(e?.label) : null
                    }}
                    value={currentlyGroupedBy != null ? { label: currentlyGroupedBy, value: currentlyGroupedBy } : null}
                    options={listGroupBy
                        .filter((groupBy) => groupBy != currentlyGroupedBy)
                        .map((groupBy) => {
                            return {
                                label: groupBy,
                                value: groupBy,
                            }
                        })}
                    width="10px"
                    placeholder={"Group By"}
                />
                <div className="mt-3">Visible Classes</div>
                <MultiSelect
                    onChange={setSelected}
                    value={selected}
                    options={allLinesForSelect()}
                    labelledBy={"Select"}
                />
            </div>
            <h2 style={{ textAlign: "center" }}>{currentChartName}</h2>
            <div className="d-flex justify-content-center mb-5" ref={chartContainerRef}>
                <Charts
                    currentlygroupedby={currentlyGroupedBy ?? ""}
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
