import React, { useMemo, useState, useEffect, useContext, useCallback } from "react"
import { Link } from "react-router-dom"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"
import { CloudComputingKernel } from "../../api/cloudComputing/models/CloudComputingKernel"
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
}: {
    kernel: CloudComputingKernel
    status: CloudComputingStatus
    client: CloudComputingAPI
    onChangedOutput: () => void
}) {
    const [state, setState] = useState<KernelExistingPageState>(computeNewState(status))
    const [intervalRef, setIntervalRef] = useState<number | undefined>(undefined)

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
                    <div>
                        <h2>Status</h2>
                        <Loading>Checking Status</Loading>
                    </div>
                )
            case KernelExisitingPageStateEnumType.WaitingStatus:
                return (
                    <div>
                        <h2>Status</h2>
                        <Loading>{state.message}</Loading>
                    </div>
                )
            case KernelExisitingPageStateEnumType.Error:
                return (
                    <div>
                        <h2>Error</h2>
                        <p>{state.message}</p>
                    </div>
                )
            case KernelExisitingPageStateEnumType.PushingKernel:
                return (
                    <div>
                        <h2>Status</h2>
                        <Loading>Pushing Kernel</Loading>
                    </div>
                )
            case KernelExisitingPageStateEnumType.Done:
                return (
                    <div>
                        <h2 className="mt-0">Done</h2>
                        <p>Execution finished</p>
                        <button className="btn btn-outline-primary disabled">View Details</button>
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
