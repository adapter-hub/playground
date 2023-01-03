import React, { useCallback, useMemo, useState } from "react"
import { Col, Form, Row } from "react-bootstrap"
import { useDropzone } from "react-dropzone"
import { toast } from "react-toastify"
import { useCheckAutenticationLazyQuery } from "../api"
import { LoadingComponent } from "../components/loading-component"

type KaggleCredentials = {
    username: string
    key: string
}

export type Credentials = {
    uri: string
} & KaggleCredentials

enum CredentialsState {
    WrongFormat,
    InvalidCredentials,
    ShowNothing,
    MissingConsent,
    Loading,
}

export function LoginPage({ login }: { login: (credentials: Credentials, rememberMe: boolean) => void }) {
    const [rememberMe, setRememberMe] = useState(false)
    const [consent, setConsent] = useState(false)
    const [uri, setUri] = useState("https://bp2020.ukp.informatik.tu-darmstadt.de/graphql")
    const [state, setState] = React.useState(CredentialsState.ShowNothing)

    const onDrop = useCallback(
        (acceptedFiles) => {
            if (!consent) {
                setState(CredentialsState.MissingConsent)
                toast.error("please consent first")
                return
            }
            acceptedFiles.forEach((file: any) => {
                const reader = new FileReader()
                reader.onload = async (e) => {
                    setState(CredentialsState.Loading)

                    try {
                        const credentials: KaggleCredentials = JSON.parse(e.target?.result as string)

                        login({ ...credentials, uri }, rememberMe)
                    } catch (error) {
                        setState(CredentialsState.WrongFormat)
                        toast.error("wrong formatted login token")
                    }
                }
                reader.readAsText(file)
            })
        },
        [rememberMe, uri, login, setState, consent]
    )

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ".json" })

    const StatusMessage = useMemo(() => {
        switch (state) {
            case CredentialsState.ShowNothing:
                return null
            case CredentialsState.WrongFormat:
                return (
                    <p style={{ pointerEvents: "none", color: "#d6331a", fontSize: "1.6rem" }}>
                        Your file was corrupted. Please try again :)
                    </p>
                )
            case CredentialsState.Loading:
                return (
                    <div className="p-3 d-flex justify-content-center">
                        <LoadingComponent>Logging in ...</LoadingComponent>
                    </div>
                )
            case CredentialsState.MissingConsent:
                return <div>Missing Consent</div>
        }
    }, [state])

    return (
        <div className="d-flex flex-column">
            <div
                className="jumbotron jumbotron-fluid py-lg-5"
                style={{
                    height: "132px",
                    width: "100%",
                    backgroundColor: "#39B3C6",
                    color: "#f0f2f5",
                    textAlign: "left",
                    lineHeight: "1.5",
                }}>
                <h2 style={{ marginLeft: "20%", fontWeight: 400, fontSize: "2.25rem" }}>
                    Welcome the Adapterhub Playground!
                </h2>
            </div>
            <div className="container">
                <h2>Select Backend to Run On</h2>
                <Form.Group>
                    <input className="form-control" type="text" value={uri} onChange={(e) => setUri(e.target.value)} />
                </Form.Group>
                <h2>Upload JSON to Sign In</h2>
                <Row className="mt-3">
                    <Col className="d-flex">
                        <Form.Group id="formGridCheckbox">
                            <Form.Check
                                required
                                type="checkbox"
                                label="* (required) I consent that the provided token may be used by our service to communicate with Kaggle."
                                onChange={(e) => setConsent((e.target as any).checked)}
                            />
                            <small>We do not store any of your data.</small>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex">
                        <Form.Group id="formGridCheckbox">
                            <Form.Check
                                type="checkbox"
                                label="Keep me logged in."
                                onChange={(e) => setRememberMe((e.target as any).checked)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <div
                    className="p-3 bg-primary rounded-pill shadow-sm"
                    style={{ cursor: "pointer" }}
                    {...getRootProps()}>
                    <input {...getInputProps()} />
                    <h3 className="m-0 text-white text-center">Upload JSON here.</h3>
                    {StatusMessage}
                </div>
            </div>
            <div className="my-5 container-sm d-flex flex-column align-items-center">
                <h3 className="mb-3" style={{ color: "#3096a6" }}>
                    System Demonstration
                    <i className="fas fa-info-circle" style={{ fontSize: "0.7em", marginLeft: "8px" }}></i>
                </h3>
                <div className="video_wrapper w-100">
                    <iframe
                        src="https://www.youtube.com/embed/RvGviBe4N5Q"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen></iframe>
                </div>
            </div>
        </div>
    )
}
