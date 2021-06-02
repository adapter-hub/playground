import React, { useEffect, useMemo, useState } from "react"
import {
    Tooltip,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
    ReferenceLine,
    Brush,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    ResponsiveContainer,
} from "recharts"
import { curveCardinal } from "d3-shape"

enum VisualizationType {
    BarChart,
    LineChart,
    AreaChart,
    PercentageAreaChart,
    CardinaleAreaChart,
}

const cardinal = curveCardinal.tension(0.2)

const getPercent = (value: number, total: number) => {
    const ratio = total > 0 ? value / total : 0

    return toPercent(ratio, 2)
}
const Color: string[] = ["#a05195", "#ff7c43", "#2f4b7c", "#ffa600", "#f95d6a", "#665191", "#d45087", "#003f5c"]

const toPercent = (decimal: number, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`
const renderTooltipContent = (o: any) => {
    const { payload, label } = o
    const total = payload?.reduce((result: any, entry: any) => result + entry.value, 0) ?? 0

    return (
        <div className="customized-tooltip-content">
            <p className="total">{`${label} (Total: ${total})`}</p>
            <ul className="list">
                {payload?.map((entry: any, index: any) => (
                    <li key={`item-${index}`} style={{ color: entry.color }}>
                        {`${entry.name}: ${entry.value}(${getPercent(entry.value, total)})`}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default function Charts({
    visualizationType,
    data,
    currentlygroupedby,
    visibleOutputLines,
}: {
    currentlygroupedby: string
    visibleOutputLines: Array<string>
    data: Array<any> | undefined
    visualizationType: VisualizationType
}) {
    let visualization: JSX.Element

    switch (visualizationType) {
        case VisualizationType.LineChart:
            visualization = (
                <LineChart
                    width={900}
                    height={600}
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={currentlygroupedby}
                        label={{ value: currentlygroupedby, position: "centerBottom", dy: 10 }}
                        height={40}
                    />
                    <YAxis label={{ value: "frequency", position: "inside", dx: -20 }} width={115} />
                    <Tooltip wrapperStyle={{ backgroundColor: "#FFF" }} />
                    <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
                    {visibleOutputLines.map((name, index) => (
                        <Line
                            key={name}
                            id={name}
                            type="monotone"
                            dataKey={name}
                            stroke={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                            connectNulls={false}
                            dot={false}
                        />
                    ))}
                </LineChart>
            )
            break
        case VisualizationType.BarChart:
            visualization = (
                <BarChart
                    width={900}
                    height={600}
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={currentlygroupedby}
                        name={currentlygroupedby}
                        label={{ value: currentlygroupedby, position: "centerBottom", dy: 10 }}
                        height={40}
                    />
                    <YAxis label={{ value: "frequency", position: "inside", dx: -20 }} width={115} />
                    <Tooltip wrapperStyle={{ backgroundColor: "#FFF" }} />
                    <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
                    <ReferenceLine y={0} stroke="#000" />
                    <Brush dataKey="name" height={30} stroke="#8884d8" />
                    {visibleOutputLines.map((name, index) => (
                        <Bar
                            key={name}
                            id={name}
                            dataKey={name}
                            stroke={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                            fill={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                        />
                    ))}
                </BarChart>
            )
            break
        case VisualizationType.AreaChart:
            visualization = (
                <AreaChart
                    width={900}
                    height={600}
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={currentlygroupedby}
                        label={{ value: currentlygroupedby, position: "centerBottom", dy: 10 }}
                        height={40}
                    />
                    <YAxis label={{ value: "frequency", position: "inside", dx: -20 }} width={115} />
                    <Tooltip wrapperStyle={{ backgroundColor: "#FFF" }} />
                    <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
                    {visibleOutputLines.map((name, index) => (
                        <Area
                            key={name}
                            id={name}
                            type="monotone"
                            dataKey={name}
                            stroke={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                            fill={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                            connectNulls={false}
                        />
                    ))}
                </AreaChart>
            )
            break
        case VisualizationType.PercentageAreaChart:
            visualization = (
                <AreaChart
                    width={900}
                    height={600}
                    data={data}
                    stackOffset="expand"
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={currentlygroupedby}
                        name={currentlygroupedby}
                        label={{ value: currentlygroupedby, position: "centerBottom", dy: 10 }}
                        height={40}
                    />
                    <YAxis
                        label={{ value: "frequency", position: "inside", dx: -20 }}
                        width={115}
                        tickFormatter={toPercent}
                    />
                    <Tooltip wrapperStyle={{ backgroundColor: "#FFF" }} content={renderTooltipContent} />
                    <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
                    {visibleOutputLines.map((name, index) => (
                        <Area
                            key={name}
                            id={name}
                            type="monotone"
                            dataKey={name}
                            stroke={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                            fill={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                            connectNulls={false}
                            stackId="1"
                        />
                    ))}
                </AreaChart>
            )
            break
        case VisualizationType.CardinaleAreaChart:
            visualization = (
                <AreaChart
                    width={900}
                    height={600}
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={currentlygroupedby}
                        label={{ value: currentlygroupedby, position: "centerBottom", dy: 10 }}
                        height={40}
                    />
                    <YAxis label={{ value: "frequency", position: "inside", dx: -20 }} width={115} />
                    <Tooltip wrapperStyle={{ backgroundColor: "#FFF" }} />
                    {visibleOutputLines.map((name, index) => (
                        <Area
                            type={cardinal}
                            key={name}
                            id={name}
                            dataKey={name}
                            stroke={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                            fill={
                                index > Color.length - 1
                                    ? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
                                    : Color[index]
                            }
                            fillOpacity={0.3}
                            connectNulls={false}
                            stackId="1"
                        />
                    ))}
                </AreaChart>
            )
            break
        default:
            visualization = <div>No Graph</div>
            break
    }
    return (
        <div className="w-100" style={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
                {visualization}
            </ResponsiveContainer>
        </div>
    )
}
