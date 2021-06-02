import React, { useRef, useState } from "react"
import { Button, Form } from "react-bootstrap"
import { GetProjectDocument, useAddPredictionTaskMutation } from "../api"
import { PredictionExplanation } from "./prediction-explanation"
import { LoadingComponent } from "./loading-component"
import {
    AdapterhubAdapterConfig,
    adapterhubAdapterConfigToNewTaskInput,
    DefaultAdapterhubAdapterConfig,
} from "./adapterhub-adapter-config"
import { toast } from "react-toastify"
import { InfoComponent } from "./info-component"

export function NewPredictionTask({
    closeModal,
    projectId,
    name,
}: {
    name: string
    projectId: number
    closeModal: () => void
}) {
    const [expertMode, setExportMode] = useState<boolean>(false)
    const [showExplanation, setShowExplanation] = useState(false)
    const [adapterhubAdapterConfig, setAdapterhubAdapterConfig] =
        useState<AdapterhubAdapterConfig>(DefaultAdapterhubAdapterConfig)

    //for prediction
    const [column, setColumn] = useState("E")

    const [addPredictionTaskMutation, { error, loading }] = useAddPredictionTaskMutation({
        onCompleted: (task) => {
            toast.success(`training task ${task.addPredictionTask.name} successfully created`)
            closeModal()
        },
        refetchQueries: [{ query: GetProjectDocument, variables: { id: projectId } }],
        awaitRefetchQueries: true,
    })

    return (
        <div className="d-flex flex-column">
            <Form.Group>
                <Form.Check
                    type="checkbox"
                    label="Expert Mode"
                    onChange={(event) => setExportMode(event.currentTarget.checked)}
                />
            </Form.Group>
            <div>
                <Form.Group>
                    <Form.Label>
                        Column in the Google Sheet
                        <InfoComponent text="The column name from the google sheets where the results should be written to." />
                    </Form.Label>
                    <input
                        className="form-control"
                        type="text"
                        value={column}
                        onChange={(event) => setColumn(event.currentTarget.value)}
                    />
                </Form.Group>
            </div>

            {expertMode && (
                <AdapterhubAdapterConfig config={adapterhubAdapterConfig} setConfig={setAdapterhubAdapterConfig} />
            )}

            <button className="btn btn-outline-primary mb-3" onClick={() => setShowExplanation(!showExplanation)}>
                {showExplanation ? "Hide Example" : "Show Example"}
            </button>

            {showExplanation && <PredictionExplanation />}

            {error && <p className="text-danger">{JSON.stringify(error)}</p>}
            <Button
                disabled={
                    loading || (adapterhubAdapterConfig.ownAdapter && adapterhubAdapterConfig.adapterConfig == null)
                }
                variant="primary"
                type="submit"
                onClick={() => {
                    if (adapterhubAdapterConfig.ownAdapter && adapterhubAdapterConfig.adapterConfig == null) {
                        return
                    }
                    addPredictionTaskMutation({
                        variables: {
                            input: {
                                name,
                                projectId,
                                sheetsColumnName: column,
                                ...adapterhubAdapterConfigToNewTaskInput(adapterhubAdapterConfig),
                            },
                        },
                    })
                }}>
                {loading ? <LoadingComponent white>Creating</LoadingComponent> : "Submit"}
            </Button>
        </div>
    )
}
