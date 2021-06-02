import React, { useCallback, useState } from "react"
import { Col, Form, Row } from "react-bootstrap"
import { useDropzone } from "react-dropzone"
import { toast } from "react-toastify"
import { useCheckAutenticationLazyQuery } from "../api"
import { LoadingComponent } from "../components/loading-component"

export type KaggleCredentials = {
    username: string
    key: string
}

enum KaggleCredentialsState {
    WrongFormat,
    InvalidCredentials,
    ShowNothing,
    MissingConsent,
    Loading,
}

export function LoginPage({ login }: { login: (credentials: KaggleCredentials, rememberMe: boolean) => void }) {
    const [rememberMe, setRememberMe] = useState(false)
    const [consent, setConsent] = useState(false)
    const [state, setState] = React.useState(KaggleCredentialsState.ShowNothing)

    const onDrop = useCallback(
        (acceptedFiles) => {
            if (!consent) {
                setState(KaggleCredentialsState.MissingConsent)
                toast.error("please consent first")
                return
            }
            acceptedFiles.forEach((file: any) => {
                const reader = new FileReader()
                reader.onload = async (e) => {
                    setState(KaggleCredentialsState.Loading)

                    try {
                        const credentials: KaggleCredentials = JSON.parse(e.target?.result as string)

                        login(credentials, rememberMe)
                    } catch (error) {
                        setState(KaggleCredentialsState.WrongFormat)
                        toast.error("wrong formatted login token")
                    }
                }
                reader.readAsText(file)
            })
        },
        [rememberMe, login, setState, consent]
    )

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ".json" })

    const StatusMessage = useCallback(() => {
        switch (state) {
            case KaggleCredentialsState.ShowNothing:
                return null
            case KaggleCredentialsState.WrongFormat:
                return (
                    <p style={{ pointerEvents: "none", color: "#d6331a", fontSize: "1.6rem" }}>
                        Your file was corrupted. Please try again :)
                    </p>
                )
            case KaggleCredentialsState.Loading:
                return (
                    <div className="p-3 d-flex justify-content-center">
                        <LoadingComponent>Logging in ...</LoadingComponent>
                    </div>
                )
            case KaggleCredentialsState.MissingConsent:
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
                <h2>Upload kaggle.json to Sign In</h2>
                <Row className="mt-3">
                    <Col className="d-flex justify-content-center">
                        <Form.Group id="formGridCheckbox">
                            <Form.Check
                                type="checkbox"
                                label="I consent that the provided token is used by our service to communicate with Kaggle."
                                onChange={(e) => setConsent((e.target as any).checked)}
                            />
                            We do not store any of your data.
                        </Form.Group>
                    </Col>
                </Row>
                <div
                    className="p-3 bg-primary rounded-pill shadow-sm"
                    style={{ cursor: "pointer" }}
                    {...getRootProps()}>
                    <input {...getInputProps()} />
                    <h3 className="m-0 text-white text-center">Upload kaggle.json here.</h3>
                    {StatusMessage}
                </div>
                <Row>
                    <Col className="d-flex justify-content-center">
                        <Form.Group id="formGridCheckbox">
                            <Form.Check
                                type="checkbox"
                                label="Keep me logged in."
                                onChange={(e) => setRememberMe((e.target as any).checked)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </div>
            <div className="mb-5 container-sm d-flex flex-column align-items-center">
                <h3 className="mb-5" style={{ color: "#3096a6" }}>
                    New to this? Watch the tutorial below.
                    <i className="fas fa-info-circle" style={{ fontSize: "0.7em", marginLeft: "8px" }}></i>
                </h3>
                <div className="video_wrapper w-100">
                    <iframe
                        src="https://www.youtube.com/embed/pnNwPqyGfX0"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen></iframe>
                </div>
            </div>
        </div>
    )
}
