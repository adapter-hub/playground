import React, { useCallback, useMemo, useState } from "react"
import { Modal, Form, Col, Button } from "react-bootstrap"
import { useHistory } from "react-router-dom"
import { CloudComputingKernelType } from "../../api/cloudComputing/models/CloudComputingKernelType"
import { Notificationstates, notify } from "../../app"
import { hashSheetId } from "../task-configuration-page/task-configuration-page"
import { GSpreadSpreadSheetAPI } from "../../api/spreadSheet/gSpread/GSpreadSpreadSheetAPI"

enum Modaltext {
    Empty,
    FillOutEverything,
    ProjectNameInUse,
    WrongSheetsLink,
    WrongPermissions,
}

export default function NewProjectModal({
    isProjectExisting,
    show,
    closeModal,
}: {
    show: boolean
    isProjectExisting: (name: string) => boolean
    closeModal: () => void
}) {
    const history = useHistory()
    const [newProjectName, setNewProjectName] = useState("")
    const [newProjectGoogleSheetLink, setNewProjectGoogleSheetLink] = useState("")
    const [messageInModal, setMessageInModal] = useState(Modaltext.Empty)

    const incompleteInput = useMemo(() => !(newProjectName.length > 0 && newProjectGoogleSheetLink.length > 0), [
        newProjectName,
        newProjectGoogleSheetLink,
    ])

    const checkForWrongInput = async (): Promise<Modaltext> => {
        if (incompleteInput) {
            return Modaltext.FillOutEverything
        }
        if (isProjectExisting(newProjectName)) {
            notify(Notificationstates.Error, "Name of new project is already in use")
            return Modaltext.ProjectNameInUse
        }
        if (!new GSpreadSpreadSheetAPI().linkMatchesRegex(newProjectGoogleSheetLink)) {
            notify(Notificationstates.Error, "Incorret Link Format")
            return Modaltext.WrongSheetsLink
        }
        let returnValue: Modaltext = Modaltext.Empty
        const idLink = new GSpreadSpreadSheetAPI().linkToSpreadSheet(newProjectGoogleSheetLink).id
        const googleSheetClient = await new GSpreadSpreadSheetAPI().hasPermissionsForSpreadSheet({
            id: idLink,
        })
        if (googleSheetClient != null) {
            if (!googleSheetClient.hasFoundSheet) {
                notify(Notificationstates.Error, "Google sheets document could not be found")
                returnValue = Modaltext.WrongSheetsLink
                return returnValue
            }
            if (!googleSheetClient.hasCorrectPermissions) {
                notify(Notificationstates.Error, "Permissions of google sheets are wrong")
                returnValue = Modaltext.WrongPermissions
                return returnValue
            }
        }
        return returnValue
    }

    const submitNewProject = useCallback(async () => {
        const result = await checkForWrongInput()
        setMessageInModal(result)
        if (result !== Modaltext.Empty) {
            return
        }

        notify(Notificationstates.Success, "Creating new Project")
        history.push(
            `/projects/${newProjectName}/${hashSheetId(
                newProjectGoogleSheetLink
            )}?sheetLink=${newProjectGoogleSheetLink}`
        )
    }, [
        isProjectExisting,
        incompleteInput,
        newProjectName,
        newProjectGoogleSheetLink,
        checkForWrongInput,
        messageInModal,
    ])

    const Incompleteinput = () => <p style={{ color: "#d6331a", fontSize: "1.2rem" }}>Please, fill out everything.</p>
    const NameInUse = () => <p style={{ color: "#d6331a", fontSize: "1.2rem" }}>The project name is already in use.</p>
    const WrongLink = () => <p style={{ color: "#d6331a", fontSize: "1.2rem" }}>Wrong google sheets link.</p>
    const WrongPermissions = () => (
        <p style={{ color: "#d6331a", fontSize: "1.2rem" }}>Google sheets permissions are set wrong.</p>
    )

    const toggleModalMessage = useMemo(() => {
        switch (messageInModal) {
            case Modaltext.FillOutEverything:
                return <Incompleteinput />
            case Modaltext.ProjectNameInUse:
                return <NameInUse />
            case Modaltext.WrongPermissions:
                return <WrongPermissions />
            case Modaltext.WrongSheetsLink:
                return <WrongLink />
            case Modaltext.Empty:
                return <div></div>
        }
    }, [messageInModal])

    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header
                style={{
                    backgroundColor: "#39B3C6",
                    color: "#f0f2f5",
                }}>
                Create a new Project!
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formProjectName">
                    {toggleModalMessage}
                    <Form.Label>Project Name:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter project name"
                        onChange={(e) => setNewProjectName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Google Sheet Link</Form.Label>
                    <input
                        className="form-control"
                        type="text"
                        onChange={(event) => setNewProjectGoogleSheetLink(event.currentTarget.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={submitNewProject}>
                    Submit
                </Button>
            </Modal.Body>
        </Modal>
    )
}
