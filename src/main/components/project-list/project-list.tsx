import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from "react"
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory from "react-bootstrap-table2-paginator"
import Button from "react-bootstrap/Button"
import { CredentialsContext, Notificationstates, notify } from "../../app"
import { Col, Container, Form, Modal, Row } from "react-bootstrap"
import { useHistory } from "react-router-dom"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"
import { KaggleCloudComputingAPI } from "../../api/cloudComputing/kaggle/KaggleCloudComputingAPI"
import { CloudComputingKernelType } from "../../api/cloudComputing/models/CloudComputingKernelType"
import { useProjects } from "../../services/project-service"
import Loading from "../loading/loading"
import NewProjectModal from "./new-project-modal"
import { CombineLatestOperator } from "rxjs/internal/observable/combineLatest"
import "../../custom.scss"

export type ProjectTableData = {
    name: string
    sheetIdHash: string
    datestring: string
    date: Date
}

export function ProjectList() {
    const [showModal, setShowModal] = useState<boolean>(false)

    const history = useHistory()
    const { credentials } = useContext(CredentialsContext)

    const { loading, projects, reload } = useProjects()

    useEffect(() => reload(), [])

    const tableData = useMemo<Array<ProjectTableData>>(
        () =>
            projects.map((project, index) => {
                const kernel = project.getKernels()[0]
                const date = new Date(kernel.lastRun)
                return {
                    index,
                    name: kernel.kernel.name,
                    sheetIdHash: kernel.kernel.sheetIdHash,
                    date,
                    datestring: date.toLocaleString(),
                }
            }),
        [projects]
    )

    const isProjectExisting = useCallback(
        (checkName: string) => tableData.find(({ name }) => checkName === name) != null,
        [tableData]
    )

    const columns = [
        {
            dataField: "name",
            text: "Projectname",
            sort: true,
        },
        {
            dataField: "datestring",
            text: "Created at",
            sort: true,
            sortFunc: (a: any, b: any, order: any, dataField: any, rowA: ProjectTableData, rowB: ProjectTableData) => {
                if (order === "asc") {
                    if (rowA.date < rowB.date) {
                        return -1
                    } else {
                        return 1
                    }
                } else {
                    if (rowA.date < rowB.date) {
                        return 1
                    } else {
                        return -1
                    }
                }
            },
        },
    ]

    return (
        <div>
            <NewProjectModal
                closeModal={() => setShowModal(false)}
                show={showModal}
                isProjectExisting={isProjectExisting}
            />
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
                        <h2 style={{ color: "#f0f2f5" }}>Hello {credentials.username}!</h2>
                    </div>
                </div>
            </div>
            <Container fluid style={{ width: "90%" }}>
                <Row>
                    <Button variant="secondary" size="lg" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus"></i> New Project
                    </Button>
                </Row>
                <div className="container d-flex h-100 justify-content-center">
                    <h3 style={{ color: "black" }}>Here are your current projects:</h3>
                </div>
                {loading ? (
                    <Loading>Loading Projects</Loading>
                ) : (
                    <BootstrapTable
                        keyField="index"
                        data={tableData}
                        columns={columns}
                        pagination={paginationFactory({ hideSizePerPage: true })}
                        classes={"BootstrapTable-hover"}
                        rowClasses={"BootstrapTable-hover-row"}
                        rowEvents={{
                            onClick: (e: SyntheticEvent, row: ProjectTableData, rowIndex: number) => {
                                history.push(`/projects/${row.name}/${row.sheetIdHash}`)
                                notify(Notificationstates.Success, "Looking at Project " + row.name)
                            },
                        }}
                    />
                )}
            </Container>
        </div>
    )
}
