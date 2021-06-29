import React, { useMemo, useRef, useState } from "react"
import { Link, RouteChildrenProps } from "react-router-dom"
import { LoadingComponent } from "../components/loading-component"
import { useGetProjectQuery } from "../api"
import { TaskComponent } from "../components/task-component"
import NewTaskModal from "../modals/new-task-modal"
import { VisualizationComponent } from "../components/visualization-component"
import { GSpread } from "../api/gspread"

export default function ProjectPage({ match }: RouteChildrenProps<{ id: string }>) {
    if (match == null) {
        throw "route match can't be undefined"
    }

    const reloadRef = useRef<() => void>()
    const { data, loading, error } = useGetProjectQuery({ variables: { id: parseInt(match.params.id) } })

    const [showModal, setShowModal] = useState(false)

    const googleSheetLink = useMemo(
        () => (data != null ? GSpread.spreadSheetIdToLink(data?.getProject.googleSheetId) : ""),
        [data?.getProject.googleSheetId]
    )

    if (error) {
        return (
            <div className="d-flex flex-column container">
                <p className="text-danger">{JSON.stringify(error)}</p>
            </div>
        )
    }

    if (loading || data == null) {
        return (
            <div className="d-flex flex-column align-items-center mb-3 mt-3">
                <LoadingComponent>Loading Tasks</LoadingComponent>
            </div>
        )
    }

    return (
        <div className="d-flex flex-column container">
            <NewTaskModal projectId={data.getProject.id} closeModal={() => setShowModal(false)} show={showModal} />
            <div className="m-3 d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex flex-row align-items-center">
                    <Link className="btn btn-primary" to={"/"}>
                        &lt; Back
                    </Link>
                    <h1 className="m-0 ml-3">Project: {data.getProject.name}</h1>
                </div>
                <a className="h4 m-0 ml-3" target="_blank" href={googleSheetLink}>
                    Google Sheet Link
                </a>
            </div>
            <div className="mb-3">
                <div className="btn btn-secondary btn-lg" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus"></i> Create Action
                </div>
                <h1>Actions</h1>
                <div className="container row">
                    {data.getProject.tasks.map((task) => (
                        <TaskComponent
                            onComplete={() => {
                                if (reloadRef.current) {
                                    reloadRef.current()
                                }
                            }}
                            projectId={data.getProject.id}
                            key={task.id}
                            taskId={task.id}
                        />
                    ))}
                </div>
            </div>
            <VisualizationComponent reloadRef={reloadRef} googleSheetId={data.getProject.googleSheetId} />
        </div>
    )
}
