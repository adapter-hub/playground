import React, { useMemo, useState } from "react"
import { Form, Modal } from "react-bootstrap"
import { TaskType } from "../api"
import { NewPredictionTask } from "../components/new-prediction-task"
import { NewClusteringTask } from "../components/new-clustering-task"
import { NewTrainingTask } from "../components/new-training-task"
import { InfoComponent } from "../components/info-component"

export default function NewTaskModal({
    show,
    closeModal,
    projectId,
}: {
    projectId: number
    show: boolean
    closeModal: () => void
}) {
    const [name, setName] = useState("")

    const [taskType, setTaskType] = useState<TaskType>(TaskType.Prediction)

    const NewTaskComponent = useMemo(() => {
        switch (taskType) {
            case TaskType.Prediction:
                return NewPredictionTask
            case TaskType.Clustering:
                return NewClusteringTask
            case TaskType.Training:
                return NewTrainingTask
        }
    }, [taskType])

    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header>Create Task</Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>
                        Name
                        <InfoComponent text="The name of the task." />
                    </Form.Label>
                    <input
                        className="form-control"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.currentTarget.value)}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Task Type</Form.Label>
                    <Form.Control
                        onChange={(event) => setTaskType(event.currentTarget.value as TaskType)}
                        as="select"
                        value={taskType}
                        custom>
                        <option key={0}>{TaskType.Prediction}</option>
                        <option key={1}>{TaskType.Training}</option>
                        <option key={2}>{TaskType.Clustering}</option>
                    </Form.Control>
                </Form.Group>
                <NewTaskComponent name={name} projectId={projectId} closeModal={closeModal} />
            </Modal.Body>
        </Modal>
    )
}
