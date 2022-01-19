import React, { useRef, useState } from "react"
import { Button, Form } from "react-bootstrap"
import { GetProjectDocument, useAddTrainingTaskMutation } from "../api"
import { LoadingComponent } from "./loading-component"
import {
    AdapterhubAdapterConfig,
    adapterhubAdapterConfigToNewTaskInput,
    DefaultAdapterhubAdapterConfig,
} from "./adapterhub-adapter-config"
import { toast } from "react-toastify"
import { TrainingExplanation } from "./training-explanation"
import { InfoComponent } from "./info-component"

const epochOptions = new Array(20).fill(null).map((_, index) => ({ value: index + 1, label: `${index + 1} Epoche(n)` }))

const learningRates = [0.00001, 0.00002, 0.00003, 0.00005, 0.0001, 0.0002, 0.0005]

const learningRateOptions = learningRates.map((rate) => ({ value: rate, label: `Learning Rate ${rate}` }))

export function NewTrainingTask({
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

    //for training
    const [learningRate, setLearningRate] = useState(0.0001)
    const [numTrainEpochs, setNumTrainEpochs] = useState(3)

    const [addTrainingTaskMutation, { loading, error }] = useAddTrainingTaskMutation({
        onCompleted: (task) => {
            toast.success(`training task ${task.addTrainingTask.name} successfully created`)
            closeModal()
        },
        refetchQueries: [{ query: GetProjectDocument, variables: { id: projectId } }],
        awaitRefetchQueries: true,
    })

    const adapterhubConfigRef = useRef<AdapterhubAdapterConfig>()

    return (
        <div className="d-flex flex-column">
            <Form.Group>
                <Form.Check
                    type="checkbox"
                    label="Expert Mode"
                    onChange={(event) => setExportMode(event.currentTarget.checked)}
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Label>
                    Epochs
                    <InfoComponent text="an Epoch can be described as one complete cycle through the entire training dataset. The number indicates the number of passes that the machine learning algorithm has completed during training." />
                </Form.Label>
                <Form.Control
                    as="select"
                    custom
                    onChange={(option) => {
                        setNumTrainEpochs(parseInt(option.currentTarget.value))
                    }}
                    value={epochOptions[numTrainEpochs - 1].value}>
                    {epochOptions.map(({ label, value }) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Label>
                    Learning Rate
                    <InfoComponent text="Rate of learning or speed at which the model learns. It regulates the amount of allocated error with which the model’s weights are updated. Smaller learning rates necessitate more training epochs because of the fewer changes. On the other hand, larger learning rates result in faster changes. A desirable learning rate is low enough for the network to converge on something useful while yet being high enough to train in a reasonable length of time." />
                </Form.Label>
                <Form.Control
                    as="select"
                    custom
                    onChange={(option) => {
                        setLearningRate(parseInt(option.currentTarget.value))
                    }}
                    value={learningRateOptions.find(({ value }) => value === learningRate)?.value}>
                    {learningRateOptions.map(({ label, value }) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <AdapterhubAdapterConfig
                training={true}
                expertMode={expertMode}
                config={adapterhubAdapterConfig}
                setConfig={setAdapterhubAdapterConfig}
            />

            <button className="btn btn-outline-primary mb-3" onClick={() => setShowExplanation(!showExplanation)}>
                {showExplanation ? "Hide Example" : "Show Example"}
            </button>

            {showExplanation && <TrainingExplanation />}

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
                    addTrainingTaskMutation({
                        variables: {
                            input: {
                                name,
                                projectId,
                                learningRate,
                                numTrainEpochs,
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
