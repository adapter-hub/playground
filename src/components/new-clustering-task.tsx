import React, { useState } from "react"
import { Button, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import {
    ClusteringTaskMethod,
    ClusteringTaskRepresentation,
    GetProjectDocument,
    useAddClusteringTaskMutation,
} from "../api"
import { InfoComponent } from "./info-component"
import { LoadingComponent } from "./loading-component"

export function NewClusteringTask({
    closeModal,
    projectId,
    name,
}: {
    name: string
    projectId: number
    closeModal: () => void
}) {
    const [addClusteringTaskMutation, { loading, error }] = useAddClusteringTaskMutation({
        onCompleted: (task) => {
            toast.success(`training task ${task.addClusteringTask.name} successfully created`)
            closeModal()
        },
        refetchQueries: [{ query: GetProjectDocument, variables: { id: projectId } }],
        awaitRefetchQueries: true,
    })

    const [representation, setRepresentation] = useState<ClusteringTaskRepresentation>(
        ClusteringTaskRepresentation.Sbert
    )
    const [method, setMethod] = useState<ClusteringTaskMethod>(ClusteringTaskMethod.Agglomerative)
    const [nClusters, setNClusters] = useState<number>(2) //TODO: must be 0 < n_clusters < n_data, must be int
    const [column, setColumn] = useState("E")

    return (
        <div className="d-flex flex-column">
            <Form.Group className="mb-2">
                <Form.Label>Representation</Form.Label>
                <Form.Control
                    as="select"
                    custom
                    onChange={(option) => {
                        setRepresentation(option.currentTarget.value as ClusteringTaskRepresentation)
                    }}
                    value={representation}>
                    <option key={0}>{ClusteringTaskRepresentation.Sbert}</option>
                    <option key={1}>{ClusteringTaskRepresentation.Tfidf}</option>
                </Form.Control>
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Label>Method</Form.Label>
                <Form.Control
                    as="select"
                    custom
                    onChange={(option) => {
                        setMethod(option.currentTarget.value as ClusteringTaskMethod)
                    }}
                    value={method}>
                    <option key={0}>{ClusteringTaskMethod.Agglomerative}</option>
                    <option key={1}>{ClusteringTaskMethod.Kmeans}</option>
                </Form.Control>
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Label>Number of Clusters</Form.Label>
                <input
                    className="form-control"
                    type="number"
                    value={nClusters}
                    onChange={(event) => setNClusters(parseInt(event.currentTarget.value))}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>
                    Column in the Google Sheet
                    <InfoComponent text="The column name from the google sheets where the results should be written to."/>
                </Form.Label>
                <input
                    className="form-control"
                    type="text"
                    value={column}
                    onChange={(event) => setColumn(event.currentTarget.value)}
                />
            </Form.Group>
            {error ?? <p className="text-danger">{JSON.stringify(error)}</p>}
            <Button
                disabled={loading}
                variant="primary"
                type="submit"
                onClick={() =>
                    addClusteringTaskMutation({
                        variables: {
                            input: {
                                sheetsColumnName: column,
                                name,
                                projectId,
                                method,
                                nClusters,
                                representation,
                            },
                        },
                    })
                }>
                {loading ? <LoadingComponent white>Creating</LoadingComponent> : "Submit"}
            </Button>
        </div>
    )
}
