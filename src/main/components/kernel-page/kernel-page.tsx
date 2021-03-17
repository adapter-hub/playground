import React, { useMemo, useState, useEffect, useContext, useCallback } from "react"
import { Link } from "react-router-dom"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"
import { KaggleCloudComputingAPI } from "../../api/cloudComputing/kaggle/KaggleCloudComputingAPI"
import { CloudComputingKernel } from "../../api/cloudComputing/models/CloudComputingKernel"
import { CloudComputingKernelType } from "../../api/cloudComputing/models/CloudComputingKernelType"
import { CloudComputingStatus } from "../../api/cloudComputing/models/CloudComputingStatus"
import { CredentialsContext } from "../../app"
import TaskConfigurationPage from "../task-configuration-page/task-configuration-page"
import Loading from "../loading/loading"
import { KernelExisitingPage } from "./kernel-existing-page"

function getKernelStatus(client: CloudComputingAPI, kernel: CloudComputingKernel) {
    return client.getStatus(kernel).catch((error) => {
        if (error.response.status === 404) {
            return Promise.resolve(undefined)
        } else {
            return Promise.reject(error)
        }
    })
}

enum KernelPageStateTypeEnum {
    Loading,
    Found,
    Creating,
    Error,
    Defining,
}

type KernelPageState =
    | {
          type: KernelPageStateTypeEnum.Defining
      }
    | {
          type: KernelPageStateTypeEnum.Creating | KernelPageStateTypeEnum.Loading
          kernel: CloudComputingKernel
      }
    | {
          type: KernelPageStateTypeEnum.Found
          status: CloudComputingStatus
          kernel: CloudComputingKernel
      }
    | {
          type: KernelPageStateTypeEnum.Error
          kernel: CloudComputingKernel
          message: string
      }

export function KernelPage({
    kernel: exisitingKernel,
    gspread,
    onChangedOutput,
    close,
    client,
    projectName,
    minimized,
}: {
    projectName: string
    kernel: CloudComputingKernel | undefined
    gspread: string
    close: () => void
    minimized: boolean
    onChangedOutput: () => void
    client: CloudComputingAPI
}) {
    const [isMinimized, setIsMinimized] = useState(minimized)
    const [state, setState] = useState<KernelPageState>(
        exisitingKernel != null
            ? {
                  type: KernelPageStateTypeEnum.Loading,
                  kernel: exisitingKernel,
              }
            : {
                  type: KernelPageStateTypeEnum.Defining,
              }
    )

    const onError = useCallback(
        (message: string, kernel: CloudComputingKernel) =>
            setState({
                type: KernelPageStateTypeEnum.Error,
                message,
                kernel,
            }),
        [setState]
    )

    useEffect(() => {
        if (exisitingKernel != null) {
            loadKernelStatus(exisitingKernel)
        }
    }, [])

    const loadKernelStatus = useCallback(
        (kernel: CloudComputingKernel) => {
            setState({
                type: KernelPageStateTypeEnum.Loading,
                kernel,
            })
            getKernelStatus(client, kernel)
                .then((status) => {
                    if (status != null) {
                        setState({
                            type: KernelPageStateTypeEnum.Found,
                            status,
                            kernel,
                        })
                    } else {
                        setState({
                            type: KernelPageStateTypeEnum.Defining,
                        })
                    }
                })
                .catch((error) => onError(error, kernel))
        },
        [setState, client, exisitingKernel, onError]
    )

    const createKernel = useCallback(
        async (kernel: CloudComputingKernel, code: string, datasource?: string) => {
            setState({
                type: KernelPageStateTypeEnum.Creating,
                kernel,
            })
            const result = await client.pushKernel(kernel, code, datasource)
            if (!result.hasPushed()) {
                onError(result.getError() ?? `unable to push kernel, please try again later`, kernel)
            } else {
                loadKernelStatus(kernel)
            }
        },
        [exisitingKernel, client, setState]
    )

    const kernel = useMemo(() => {
        return exisitingKernel ?? (state.type !== KernelPageStateTypeEnum.Defining ? state.kernel : undefined)
    }, [state])

    //TODO show the specified sheet column

    const computeContent = useCallback(() => {
        const className = isMinimized ? "d-none" : ""
        switch (state.type) {
            case KernelPageStateTypeEnum.Creating:
                return (
                    <div className={className}>
                        <h2>Status</h2>
                        <Loading>Creating</Loading>
                    </div>
                )
            case KernelPageStateTypeEnum.Loading:
                return (
                    <div className={className}>
                        <h2>Status</h2>
                        <Loading>Loading</Loading>
                    </div>
                )
            case KernelPageStateTypeEnum.Error:
                return (
                    <div className={className}>
                        <h2>Error</h2>
                        <p>{state.message}</p>
                    </div>
                )
            case KernelPageStateTypeEnum.Found:
                return (
                    <KernelExisitingPage
                        className={className}
                        kernel={state.kernel}
                        client={client}
                        status={state.status}
                        onChangedOutput={onChangedOutput}
                    />
                )
            case KernelPageStateTypeEnum.Defining:
                return (
                    <TaskConfigurationPage
                        client={client}
                        close={close}
                        projectName={projectName}
                        gspread={gspread}
                        onStart={(kernel, code, datasource?) => createKernel(kernel, code, datasource)}
                    />
                )
        }
    }, [createKernel, onChangedOutput, state, projectName, client, isMinimized])

    return (
        <div className="col-lg-6 p-2">
            <div className="d-flex flex-column mb-3 p-3 card shadow bg-white">
                <div
                    onClick={() => setIsMinimized(!isMinimized)}
                    style={{ cursor: "pointer" }}
                    className="d-flex flex-row align-items-center">
                    {state.type !== KernelPageStateTypeEnum.Defining && (
                        <i className={`ml-1 mr-3 fa ${isMinimized ? "fa-angle-right" : "fa-angle-down"}`}></i>
                    )}
                    {kernel != null &&
                        (kernel.type === CloudComputingKernelType.analysis ? (
                            <h4 className="mt-0">Analysis in Column: {toColumn(kernel.sheetColumn - 1)}</h4>
                        ) : (
                            <h4 className="mt-0">Training ID: {kernel.sheetColumn}</h4>
                        ))}
                </div>
                {computeContent()}
            </div>
        </div>
    )
}

function toColumn(index: number): string {
    if (index < 0) {
        return ""
    }
    const cur = String.fromCharCode((index % 26) + 65)
    if (index < 26) {
        return cur
    } else {
        return toColumn(Math.floor(index / 26) - 1) + cur
    }
}