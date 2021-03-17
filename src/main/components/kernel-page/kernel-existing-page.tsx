import React, { useMemo, useState, useEffect, useContext, useCallback } from "react"
import { Link } from "react-router-dom"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"
import { KaggleCloudComputingProject } from "../../api/cloudComputing/kaggle/models/KaggleCloudComputingProject"
import { CloudComputingKernel } from "../../api/cloudComputing/models/CloudComputingKernel"
import { CloudComputingOutputFile } from "../../api/cloudComputing/models/CloudComputingOutput"
import { CloudComputingStatus } from "../../api/cloudComputing/models/CloudComputingStatus"
import Loading from "../loading/loading"

function checkKernelStatus(
    client: CloudComputingAPI,
    kernel: CloudComputingKernel,
    setState: (state: KernelExistingPageState) => void,
    onChangedOutput: () => void
) {
    client
        .getStatus(kernel)
        .then((status) => {
            const newState = computeNewState(status)
            if (newState.type === KernelExisitingPageStateEnumType.Done) {
                onChangedOutput()
            }
            setState(newState)
        })
        .catch((error) =>
            setState({
                type: KernelExisitingPageStateEnumType.Error,
                message: error,
            })
        )
}

export function KernelExisitingPage({
    kernel,
    status,
    client,
    onChangedOutput,
    className,
}: {
    kernel: CloudComputingKernel
    status: CloudComputingStatus
    client: CloudComputingAPI
    onChangedOutput: () => void
    className: string
}) {
    const [state, setState] = useState<KernelExistingPageState>(computeNewState(status))
    const [intervalRef, setIntervalRef] = useState<number | undefined>(undefined)
    const [metadata, setMetadata] = useState<
        | {
              sheetId: string
              accuracy?: number
              errors: string | undefined
              warnings: string | undefined
              files: Array<CloudComputingOutputFile>
          }
        | null
        | undefined
    >(null)

    const removeInterval = useCallback(() => {
        clearInterval(intervalRef)
        setIntervalRef(undefined)
    }, [setIntervalRef, intervalRef])

    useEffect(() => {
        if (state.type === KernelExisitingPageStateEnumType.WaitingStatus) {
            if (intervalRef == null) {
                setIntervalRef(
                    setInterval(
                        () => checkKernelStatus(client, kernel, setState, onChangedOutput),
                        CheckKernelIntervalMillis
                    )
                )
            }
        } else {
            if (intervalRef != null) {
                removeInterval()
            }
        }

        if (state.type === KernelExisitingPageStateEnumType.Done) {
            KaggleCloudComputingProject.loadSheetsMetadata(client, kernel).then(setMetadata)
        }
    }, [state.type]) //only execute when type changes

    useEffect(() => {
        //cleanup after component is removed from dom
        return () => {
            if (intervalRef != null) {
                removeInterval()
            }
        }
    }, [])

    const calculateContent = () => {
        switch (state.type) {
            case KernelExisitingPageStateEnumType.CheckingStatus:
                return (
                    <div className={className}>
                        <h5>Status</h5>
                        <Loading>Checking Status</Loading>
                    </div>
                )
            case KernelExisitingPageStateEnumType.WaitingStatus:
                return (
                    <div className={className}>
                        <h5>Status</h5>
                        <Loading>
                            {state.message} - <span className="font-weight-bold">this takes several minutes</span>
                        </Loading>
                    </div>
                )
            case KernelExisitingPageStateEnumType.Error:
                return (
                    <div className={className}>
                        <h5>Error</h5>
                        <span>{state.message}</span>
                    </div>
                )
            case KernelExisitingPageStateEnumType.PushingKernel:
                return (
                    <div className={className}>
                        <h5>Status</h5>
                        <Loading>Pushing Kernel</Loading>
                    </div>
                )
            case KernelExisitingPageStateEnumType.Done:
                return (
                    <div className={className}>
                        <h5 className="mt-0">Done</h5>
                        {metadata === null ? (
                            <Loading></Loading>
                        ) : (
                            <div>
                                Execution finished
                                {metadata ? (
                                    <div>
                                        {metadata.accuracy}
                                        {metadata?.files.length > 0 && (
                                            <div>
                                                <h5>Files</h5>
                                                {metadata?.files.map((file, index) => (
                                                    <a className="d-block" key={index} href={file.url}>
                                                        {file.fileName}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    "metadata not stored"
                                )}
                                {metadata?.warnings && (
                                    <div>
                                        <h5>Warnings</h5>
                                        {metadata.warnings}
                                    </div>
                                )}
                                {metadata?.errors && (
                                    <div>
                                        <h5>Errors</h5>
                                        {metadata.errors}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
        }
    }

    return calculateContent()
}

const CheckKernelIntervalMillis = 3000

export enum KernelExisitingPageStateEnumType {
    PushingKernel,
    CheckingStatus,
    WaitingStatus,
    Done,
    Error,
}

export type KernelExistingPageState =
    | {
          type: KernelExisitingPageStateEnumType.PushingKernel
      }
    | {
          type: KernelExisitingPageStateEnumType.CheckingStatus
      }
    | {
          type: KernelExisitingPageStateEnumType.WaitingStatus
          message: string
      }
    | {
          type: KernelExisitingPageStateEnumType.Done
      }
    | {
          type: KernelExisitingPageStateEnumType.Error
          message: string
      }

function computeNewState(status: CloudComputingStatus): KernelExistingPageState {
    switch (status.getStatus()) {
        case "complete":
            return {
                type: KernelExisitingPageStateEnumType.Done,
            }
        case "error":
            return {
                type: KernelExisitingPageStateEnumType.Error,
                message: status.getFailureMessage() ?? "unkown kernel execution error",
            }
        case "queued":
        case "running":
            return {
                type: KernelExisitingPageStateEnumType.WaitingStatus,
                message: status.getStatus(),
            }
    }
}
