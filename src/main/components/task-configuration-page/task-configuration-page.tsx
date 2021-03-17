import React, { useEffect, useState } from "react"
import { Form } from "react-bootstrap"
import { findFirstOrDefault } from "../../toolbox"
import { Adapter } from "../main-panel/main-panel"
import Tasks from "../../../../generated/AdapterHub.json"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs"
import "prismjs/components/prism-python"
import { generateCode } from "../../code-generation/main"
import "prismjs/themes/prism-okaidia.css"
import { CloudComputingKernel } from "../../api/cloudComputing/models/CloudComputingKernel"
import { CloudComputingKernelType } from "../../api/cloudComputing/models/CloudComputingKernelType"
import { AnalysisExplanation } from "./analysis-explanation"
import Select from "react-select"
import { AdapterInputzone } from "../inputzone/adapter-inputzone"
import ReactTooltip from "react-tooltip"
import { AdapterConfig } from "../../services/adapter-parse-service"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"

export type Dataset = {
    name: string
    dataset: string
    defaultAdapterIdentifer: string
    adapters: Array<Adapter>
}

const epochOptions = new Array(20).fill(null).map((_, index) => ({ value: index + 1, label: `${index + 1} Epoche(n)` }))

const learningRates = [0.00001, 0.00002, 0.00003, 0.00005, 0.0001, 0.0002, 0.0005]

const learningRateOptions = learningRates.map((rate) => ({ value: rate, label: `Learning Rate ${rate}` }))

export type TaskType = {
    name: string
    task: string
    defaultDatasetName: string
    datasets: Array<Dataset>
}

function getDefaultDataset(taskType: TaskType) {
    return findFirstOrDefault(taskType.datasets, (dataset) => dataset.name === taskType.defaultDatasetName)
}

function getDefaultAdapter(dataset: Dataset) {
    return findFirstOrDefault(
        dataset.adapters,
        (adapter) => getAdapterIdentifier(adapter) === dataset.defaultAdapterIdentifer
    )
}

const DefaultTaskType = Tasks.find((task) => task.task === "sentiment")!

const DefaultDataset = getDefaultDataset(DefaultTaskType)
const DefaultAdapter = getDefaultAdapter(DefaultDataset)

function getAdapterIdentifier(adapter: Adapter): string {
    return `${adapter.modelName} | ${adapter.architecture}`
}

export default function TaskConfigurationPage({
    onStart,
    gspread,
    projectName,
    client,
    close,
}: {
    client: CloudComputingAPI
    onStart: (kernel: CloudComputingKernel, code: string, datasource?: string) => void
    projectName: string
    gspread: string
    close: () => void
}) {
    const [selectedTaskType, setSelectedTaskTypeState] = useState<TaskType>(DefaultTaskType)
    const [selectedDataset, setSelectedDatasetState] = useState<Dataset>(DefaultDataset)
    const [selectedAdapter, setSelectedAdapter] = useState<Adapter>(DefaultAdapter)
    const [expertMode, setExportMode] = useState<boolean>(false)
    const [expertSelection, setExpertSelection] = useState<"config" | "codeEditor" | "uploadAdapter">("config")
    const [ownAdapter, setOwnAdapter] = useState(false)
    const [showExplanation, setShowExplanation] = useState(false)

    //for analysis
    const [column, setColumn] = useState("E")
    const [classificationName, setClassificationName] = useState("")

    //for training
    const [learningRate, setLearningRate] = useState(0.0001)
    const [numTrainEpochs, setNumTrainEpochs] = useState(3)

    const [executionType, setExecutionType] = useState<CloudComputingKernelType>(CloudComputingKernelType.analysis)

    const [code, setCode] = useState<string>("")

    const [adapterConfig, setAdapterConfig] = useState<(AdapterConfig & { filename: string }) | undefined>(undefined)

    useEffect(() => {
        setCode(
            generateCode({
                taskType: selectedTaskType.task,
                sheetsAccessToken: `{"type": "service_account","project_id": "testsheets-297914","private_key_id": "5ea165b82d629bac7c1fe35f3935e1db6f1175ae","private_key": "-----BEGIN PRIVATE KEY-----\\\\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCj3XWZP6+6Uhyh\\\\nAPUaldFsCp7b9yGvLnJuv+AyKyyJ6kpL0wqFiovhLoLgKRXQ57V4M3ZeoaU/XAkP\\\\nWHO8P71T/YcrtMK1UP5kMg4axYb+oJirIAiy1IUmAp4vjlGcosulYlMcURawOASP\\\\nj/bZA19F9/tvL5GDcH9lRdzQPPK8rD20udaSWHeJ2uM3e0irsM2co+KTWnX4D8tb\\\\nWWolxIEQtd3158udG3KxligNBrT+6EIGg2iPTsFyD3JvAZkwP6aFJmqr+9LSXcJ7\\\\nhYnRevldRVVjkOfG84nPwPkmFYAwT8RFa4gmp3wWajqbO89S1y2kM5uHz6qEX8lh\\\\nH9cdbJ2RAgMBAAECggEABbaZ/A7hZKCqSN7MrPGeTKMOKOMz9HStHrln6rfgpKpb\\\\njss76a4L9Hz3qTMlhJQfmqJItUHzjgL6eeN+nYinZD9JsDdsNoAtbnbkUQCkFUqq\\\\nKAVE6F9KiSm8NDJFHC385bZI6YrWPKynVA4T8DsS3lCoHpdM/oU0m+ZUrZoCaJuW\\\\nbAnepWabGywyDiMV2qb5OpZnVYPVPpsWk/+xOTmerAQFW98Q+LAiUG+UOskSed+l\\\\nCEcQi/CqS6AiGPC/W/QltXMSd//a5GryHVpNdJ6z2xdc+miKIPZqyai1W7CNiZyD\\\\nNKPOb+whtzHUdX0sRaf0W4QV5QzjaCV4LJ182laRJQKBgQDitP6kwn98bTZV8eOm\\\\nRGKGsx3ED18enb2FCB+1gtW7xjkXwTKCNLMUgIoYx1wCc+qDuxuV5KN6gZgNID5s\\\\nqIdpISoaS+M44u5Rygx8Qn6WA20hsc1hlRi8tuAm24vP9kmKN64mNBqcEfVevlyp\\\\nnvPpwMCZLWDW/3BIfNyDe+HKEwKBgQC5CcgdKsqyFwHZ+oNbZxnbocApgQzYeuLk\\\\nLDT5qMasdcRvR17QNqb+yTPem60FV8cUrqhf8To1F9rNRJWnd05K4UPp2vZUqsan\\\\n5KBJZNfPtj+26bkoJCARGAnTB+MRHliXz1W92Lfv48sNdWR+5taajQVH6Wn1IDrd\\\\n+7dXrw0uSwKBgAVfRp1+4mh/agc1WTCqdC8+9VidCKMAF+qcG6xAcnIlq1qtwFWn\\\\njArTVPJrXvnL52XBvFCb/2e6xHCjL/eBMtxB5e6Dl9nUPtN/VzZmmPtTD3X58aT7\\\\nVH+8Ual6EGEYM/vrf9v15h+GqWraVfXLB3qlj6rRkXbmzLFbDBqth9czAoGAIQAF\\\\nmG4RSEGiKuXql1qD2g+23bAOQm1oGZlouT3IcOlv5wireCbHEZmAjqrk6JcHAkFD\\\\n9hhncSCX/RPGPN+iLuiN3B8Y33C1jSvRCkXZ10mBg3Wbd/U5YtMOrXwymtL2qdxo\\\\nRjtoUngltnjBO4CftWCBGJogM39UAFLsF884YpECgYANj5q/R1R0tpVagcfPzF8+\\\\nnNwG2ohkdR9q5RQrCU7Vopvzd2MYssk0LIOnAlhSqeYQk2VMyqAfERpdf9dUPqfe\\\\njqFe0lNZHIDcy1592oB8MUQ8aDAcntH+vwWUW1feGPVLp1AlyQ8Dkcu+IPR2k1jp\\\\n8UwhxeJSjADqQ55Jzjuizg==\\\\n-----END PRIVATE KEY-----\\\\n","client_email": "hanz-590@testsheets-297914.iam.gserviceaccount.com","client_id": "103458971298238973578","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/hanz-590%40testsheets-297914.iam.gserviceaccount.com"}`,
                sheetsDocumentURL: gspread,
                ...(ownAdapter
                    ? {
                          useOwnAdapter: true,
                          zipFileName: adapterConfig?.filename ?? "<adapter filename will be filled in here>",
                          modelName: adapterConfig?.model_name ?? "<adapter modelName will be filled in here>",
                          modelTransformerClass:
                              adapterConfig?.model_class ?? "<adapter modelTransformerClass will be filled in here>",
                          trainingDataset:
                              adapterConfig?.adapter_name ?? "<adapter trainingDataset will be filled in here>",
                      }
                    : {
                          useOwnAdapter: false,
                          adapterArchitecture: selectedAdapter.architecture,
                          adapterGroupName: selectedAdapter.groupname,
                          nlpTaskType: selectedAdapter.nlpTaskType,
                          modelName: selectedAdapter.modelName,
                          modelTransformerClass: selectedAdapter.modelTransformerClass,
                          trainingDataset: selectedDataset.dataset,
                      }),
                ...(executionType === CloudComputingKernelType.analysis
                    ? {
                          doTraining: false,
                          newNameOfResultColumn: classificationName,
                          sheetsColumnName: column,
                      }
                    : {
                          doTraining: true,
                          learningRate,
                          numTrainEpochs,
                      }),
            })
        )
    }, [
        selectedTaskType,
        selectedDataset,
        selectedAdapter,
        adapterConfig,
        ownAdapter,
        gspread,
        classificationName,
        column,
        numTrainEpochs,
        learningRate,
        executionType,
    ])

    const setSelectedTaskType = (taskType: TaskType) => {
        setSelectedTaskTypeState(taskType)
        setSelectedDataset(getDefaultDataset(taskType))
    }

    const setSelectedDataset = (dataset: Dataset) => {
        setSelectedDatasetState(dataset)
        setSelectedAdapter(getDefaultAdapter(dataset))
    }

    useEffect(() => {
        ReactTooltip.rebuild()
    }, [executionType])

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-center">
                <h4>Create Task</h4>
                <div className="flex-grow-1"></div>
                <button className="btn" onClick={close}>
                    <i className="fa fa-times"></i>
                </button>
            </div>
            <Form.Group>
                <Form.Check
                    type="checkbox"
                    label="Expert Mode"
                    onChange={(event) => setExportMode(event.currentTarget.checked)}
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Task Type</Form.Label>
                <Form.Control
                    onChange={(event) => setExecutionType(event.currentTarget.value as CloudComputingKernelType)}
                    as="select"
                    value={executionType}
                    custom>
                    <option key={0}>{CloudComputingKernelType.analysis}</option>
                    <option key={1}>{CloudComputingKernelType.training}</option>
                </Form.Control>
            </Form.Group>

            {executionType === CloudComputingKernelType.training ? (
                <div>
                    <Select
                        value={epochOptions[numTrainEpochs - 1]}
                        className="mb-2"
                        onChange={(option) => {
                            const val: number = option == null ? 3 : (option.value as any)
                            setNumTrainEpochs(val)
                        }}
                        options={epochOptions}></Select>
                    <Select
                        className="mb-2"
                        value={learningRateOptions.find(({ value }) => value === learningRate)}
                        onChange={(option) => {
                            const val: number = option == null ? 0.0001 : (option.value as any)
                            setLearningRate(val)
                        }}
                        options={learningRateOptions}></Select>
                </div>
            ) : (
                <div>
                    <Form.Group>
                        <Form.Label>
                            Column in the Google Sheet
                            <i
                                className="fas fa-info-circle text-primary ml-2"
                                data-for="main"
                                data-tip="The column name from the google sheets where the results should be written to."
                            />
                        </Form.Label>
                        <input
                            className="form-control"
                            type="text"
                            value={column}
                            onChange={(event) => setColumn(event.currentTarget.value)}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>
                            Classification Name
                            <i
                                className="fas fa-info-circle text-primary ml-2"
                                data-for="main"
                                data-tip="The name that will be written as the column header and the name that is used in the graph."
                            />
                        </Form.Label>
                        <input
                            className="form-control"
                            type="text"
                            value={classificationName}
                            onChange={(event) => setClassificationName(event.currentTarget.value)}
                        />
                    </Form.Group>
                </div>
            )}

            {expertMode && (
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <a
                            onClick={() => {
                                setOwnAdapter(false)
                                setExpertSelection("config")
                            }}
                            className={expertSelection == "config" ? "nav-link active" : "nav-link"}
                            aria-current="page"
                            style={{ cursor: "pointer" }}>
                            Config
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            onClick={() => {
                                setOwnAdapter(true)
                                setExpertSelection("uploadAdapter")
                            }}
                            className={expertSelection == "uploadAdapter" ? "nav-link active" : "nav-link"}
                            aria-current="page"
                            style={{ cursor: "pointer" }}>
                            Upload Adapter
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            onClick={() => setExpertSelection("codeEditor")}
                            className={expertSelection == "codeEditor" ? "nav-link active" : "nav-link"}
                            aria-current="page"
                            style={{ cursor: "pointer" }}>
                            Code Editor
                        </a>
                    </li>
                </ul>
            )}
            {expertSelection == "config" || expertSelection == "uploadAdapter" || !expertMode ? (
                <Form>
                    <Form.Group>
                        <Form.Label>Analysis Task Type</Form.Label>
                        <Form.Control
                            onChange={(event) =>
                                setSelectedTaskType(
                                    findFirstOrDefault(Tasks, (t) => t.name === event.currentTarget.value)
                                )
                            }
                            as="select"
                            value={selectedTaskType.name}
                            custom>
                            {Tasks.map((taskType, index) => (
                                <option key={index}>{taskType.name}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {expertMode &&
                        expertSelection == "config" && [
                            <Form.Group key={"dataset"}>
                                <Form.Label>Dataset</Form.Label>
                                <Form.Control
                                    onChange={(event) =>
                                        setSelectedDataset(
                                            findFirstOrDefault(
                                                selectedTaskType.datasets,
                                                (t) => t.name === event.currentTarget.value
                                            )
                                        )
                                    }
                                    value={selectedDataset.name}
                                    as="select"
                                    custom>
                                    {selectedTaskType.datasets.map((dataset, index) => (
                                        <option key={index}>{dataset.name}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>,

                            <Form.Group key={"adapter"}>
                                <Form.Label>Adapter</Form.Label>
                                <Form.Control
                                    onChange={(event) =>
                                        setSelectedAdapter(
                                            findFirstOrDefault(
                                                selectedDataset.adapters,
                                                (t) => getAdapterIdentifier(t) === event.currentTarget.value
                                            )
                                        )
                                    }
                                    value={getAdapterIdentifier(selectedAdapter)}
                                    as="select"
                                    custom>
                                    {selectedDataset.adapters.map((adapter, index) => (
                                        <option key={index}>{getAdapterIdentifier(adapter)}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>,
                        ]}

                    {expertMode &&
                        expertSelection == "uploadAdapter" && [
                            <p key="warning" className="font-weight-bold text-warning">
                                Please make sure your adapter was trained on the matching task!
                            </p>,
                            <AdapterInputzone
                                key="adapterInputzone"
                                client={client}
                                onAdapterUploaded={setAdapterConfig}
                            />,
                        ]}
                </Form>
            ) : (
                <Editor
                    value={code}
                    onValueChange={(code) => setCode(code)}
                    highlight={(code) => highlight(code, languages.python, "py")}
                    padding={10}
                    className="mb-3"
                    preClassName="language-py"
                    style={{
                        caretColor: "white",
                        background: "#272822",
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14,
                    }}
                />
            )}

            <button className="btn btn-outline-primary mb-3" onClick={() => setShowExplanation(!showExplanation)}>
                {showExplanation ? "Hide Example" : "Show Example"}
            </button>

            {showExplanation && <AnalysisExplanation />}

            <button
                className={`btn btn-primary mb-3 ${
                    expertSelection === "uploadAdapter" && adapterConfig == null ? "disabled" : ""
                }`}
                onClick={() => {
                    let columnIndex: number
                    if (executionType === CloudComputingKernelType.analysis) {
                        columnIndex = columnNameToIndex(column)
                        if (columnIndex < 0) {
                            return
                        }
                    } else {
                        columnIndex = Math.floor(Math.random() * 1000)
                    }
                    if (expertSelection === "uploadAdapter" && adapterConfig == null) {
                        return
                    }
                    onStart(
                        {
                            name: projectName,
                            sheetColumn: columnIndex,
                            sheetIdHash: hashSheetId(gspread),
                            type: executionType,
                        },
                        code,
                        adapterConfig != null ? adapterConfig.filename : undefined
                    )
                }}>
                Start
            </button>
        </div>
    )
}

function columnNameToIndex(col: string): number {
    if (col.length === 0) {
        return -1
    }
    const index = Math.min(26, Math.max(0, col.charCodeAt(col.length - 1) - 65))
    return 1 + index + (columnNameToIndex(col.substring(0, col.length - 1)) + 1) * 26
}

export function hashSheetId(str: string): string {
    let hash = 0
    let chr: number
    for (let i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
    }
    return new Uint32Array([hash])[0].toString(16).substr(0, 6).padStart(6, "0")
}
