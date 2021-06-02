import React, { useState } from "react"
import { Button, Table } from "react-bootstrap"
import { useHistory } from "react-router-dom"
import { toast } from "react-toastify"
import { GetProjectsDocument, useDeleteProjectMutation, useGetProjectsQuery } from "../api"
import { LoadingComponent } from "../components/loading-component"
import NewProjectModal from "../modals/new-project-modal"

export function ProjectListPage() {
    const { loading, data } = useGetProjectsQuery()

    const history = useHistory()

    const [showModal, setShowModal] = useState(false)
    const [deleteProjectMutation] = useDeleteProjectMutation({
        awaitRefetchQueries: true,
        refetchQueries: [{ query: GetProjectsDocument }],
    })

    return (
        <div>
            <NewProjectModal closeModal={() => setShowModal(false)} show={showModal} />
            <div
                className="jumbotron jumbotron-fluid py-lg-5 "
                style={{
                    height: "50px",
                    width: "100%",
                    backgroundColor: "#39B3C6",
                    color: "#f0f2f5",
                    lineHeight: "1.5",
                }}>
                <div className="container d-flex h-100 justify-content-center">
                    <div className="row justify-content-center align-self-center">
                        <h2 style={{ color: "#f0f2f5" }}>Hello </h2>
                    </div>
                </div>
            </div>
            <div className="container-fluid" style={{ width: "90%" }}>
                <div className="row">
                    <div className="btn btn-secondary btn-lg" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus"></i> Create Project
                    </div>
                </div>
                <div className="container d-flex h-100 justify-content-center">
                    <h3 style={{ color: "black" }}>Projects</h3>
                </div>
                {loading ? (
                    <LoadingComponent>Loading Projects</LoadingComponent>
                ) : (
                    <Table hover striped>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Google Sheet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.getProjects.map((project) => (
                                <tr
                                    key={project.id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => history.push(`projects/${project.id}`)}>
                                    <td>{project.name}</td>
                                    <td className="d-flex flex-row">
                                        {project.googleSheetId}
                                        <div className="flex-grow-1" />
                                        <Button
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                deleteProjectMutation({ variables: { id: project.id } }).then(() =>
                                                    toast.success(
                                                        `project ${project.name} successfully deleted`
                                                    )
                                                )
                                            }}
                                            variant="outline-danger">
                                            <i className="fa fa-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    )
}
