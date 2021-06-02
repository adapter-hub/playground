import React, { useState } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { toast } from "react-toastify"
import { GetProjectsDocument, useAddProjectMutation } from "../api"
import { GSpread } from "../api/gspread"
import { LoadingComponent } from "../components/loading-component"

export default function NewProjectModal({ show, closeModal }: { show: boolean; closeModal: () => void }) {
    const [addProjectMutation, { loading, error }] = useAddProjectMutation({
        onCompleted: (project) => {
            toast.success(`project ${project.addProject.name} successfully created`)
            closeModal()
        },
        refetchQueries: [{ query: GetProjectsDocument }],
        awaitRefetchQueries: true,
    })

    const [name, setName] = useState("")
    const [googleSheetId, setGoogleSheetId] = useState<undefined | string>(undefined)

    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header>Create Project</Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formProjectName">
                    <Form.Label>Project Name:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter project name"
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Google Sheet Link</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter Google Sheet Link"
                        onChange={(event) => setGoogleSheetId(GSpread.linkToSpreadSheet(event.currentTarget.value))}
                    />
                </Form.Group>
                {error ?? <p className="text-danger">{JSON.stringify(error)}</p>}
                <Button
                    disabled={loading}
                    variant="primary"
                    type="submit"
                    onClick={() => {
                        if (googleSheetId != null && name.length > 0) {
                            addProjectMutation({
                                variables: { input: { name, googleSheetId } },
                            })
                        }
                    }}>
                    {loading ?? <LoadingComponent />} Submit
                </Button>
            </Modal.Body>
        </Modal>
    )
}
