import React, { useEffect, useMemo, useState } from "react"
import { Button } from "react-bootstrap"
import { toast } from "react-toastify"
import { GetProjectDocument, TaskFragment, TaskStatus, useDeleteTaskMutation, useGetTaskQuery } from "../api"
import { LoadingComponent } from "./loading-component"

function TaskOutputComponent({ task }: { task: TaskFragment }) {
    if (task.output == null) {
        return null
    }
    return (
        <div className="d-flex flex-column">
            {task.output.accuracy != null && <h5 className="mt-2">Accuracy: {task.output.accuracy}</h5>}
            {task.output.f1 != null && <h5 className="mt-2">F1: {task.output.f1}</h5>}
            {task.output.error && <h5 className="mt-2 text-danger">{task.output.error}</h5>}
            <h4 className="mt-2">Files</h4>
            <ul>
                <li>
                    <a
                        onClick={(e) => e.stopPropagation()}
                        download="log.txt"
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(task.output.log)}`}>
                        Logs
                    </a>
                </li>
                {task.output.files.map((file) => (
                    <li key={file.name}>
                        <a onClick={(e) => e.stopPropagation()} download href={file.url}>
                            {file.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function TaskComponent({
    taskId,
    projectId,
    onComplete,
}: {
    onComplete: () => void
    taskId: number
    projectId: number
}) {
    const [isMinimized, setIsMinimized] = useState(true)

    const [deleteTaskMutation] = useDeleteTaskMutation({
        refetchQueries: [{ query: GetProjectDocument, variables: { id: projectId } }],
        awaitRefetchQueries: true,
    })

    const { data, refetch, loading, error } = useGetTaskQuery({
        fetchPolicy: "network-only",
        variables: {
            id: taskId,
        },
    })

    useEffect(() => {
        if (data?.getTask.status === TaskStatus.Queued || data?.getTask.status === TaskStatus.Running) {
            const interval = window.setInterval(refetch, 20000)
            return () => window.clearInterval(interval)
        }
    }, [data?.getTask.status, refetch])

    const component = useMemo(() => {
        switch (data?.getTask.status) {
            case TaskStatus.Running:
                return <LoadingComponent>Running</LoadingComponent>
            case TaskStatus.Error:
                return <h4 className="text-danger">Error</h4>
            case TaskStatus.Queued:
                return <LoadingComponent>Queued</LoadingComponent>
            case TaskStatus.Complete:
                onComplete()
                return <h4 className="text-primary">Complete</h4>
            default:
                return null
        }
    }, [data?.getTask.status])

    return (
        <div className="col-lg-6 p-2">
            <div
                style={{ cursor: "pointer" }}
                onClick={() => setIsMinimized(!isMinimized)}
                className="d-flex flex-column mb-3 p-3 card shadow bg-white">
                <div className="d-flex flex-column">
                    <div key="task" className="d-flex flex-row align-items-center justify-content-between">
                        {error != null && <p className="text-danger">{error.message}</p>}
                        {loading && <LoadingComponent>Loading</LoadingComponent>}
                        {data != null && (
                            <div className="d-flex flex-row align-items-center">
                                {(data.getTask.status === TaskStatus.Error ||
                                    data.getTask.status === TaskStatus.Complete) && (
                                    <i
                                        className={`ml-1 mr-3 fa ${
                                            isMinimized ? "fa-angle-right" : "fa-angle-down"
                                        }`}></i>
                                )}
                                <h4 className="mt-0">
                                    {data?.getTask.name} | {data?.getTask.type}
                                </h4>
                            </div>
                        )}
                        {component}
                        <Button
                            variant="outline-danger"
                            onClick={(e) => {
                                e.stopPropagation()
                                deleteTaskMutation({ variables: { id: taskId } }).then(() =>
                                    toast.success(`action ${data?.getTask.name ?? ""} successfully deleted`)
                                )
                            }}>
                            <i className="fa fa-trash" />
                        </Button>
                    </div>
                    {(data?.getTask.status === TaskStatus.Error || data?.getTask.status === TaskStatus.Complete) &&
                        !isMinimized && <TaskOutputComponent key="task-output" task={data.getTask} />}
                </div>
            </div>
        </div>
    )
}
