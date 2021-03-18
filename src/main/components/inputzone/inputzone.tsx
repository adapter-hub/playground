import React, { useCallback, useState } from "react"
import { Col, Form, Row } from "react-bootstrap"
import { useDropzone } from "react-dropzone"
import { useHistory } from "react-router-dom"
import styled from "styled-components"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"
import { KaggleCloudComputingAPI } from "../../api/cloudComputing/kaggle/KaggleCloudComputingAPI"
import { credentialsAuthorized, Notificationstates, notify } from "../../app"
import Loading from "../loading/loading"

const Container = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border-width: 4px;
    border-radius: 4px;
    border-color: #ff8513;
    border-style: solid;
    background-color: #f8d4d4;
    color: black;
    outline: none;
    transition: border 0.24s ease-in-out;
    margin-bottom: 1%;
    margin-top: 4%;
    margin-left: 25%;
    margin-right: 25%;
    font-size: x-large;
`

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

export function Inputzone({
    onKaggleCredentials,
}: {
    onKaggleCredentials: (credentials: KaggleCredentials, rememberMe: boolean) => void
}) {
    const [rememberMe, setRememberMe] = useState(false)
    const [consent, setConsent] = useState(false)
    const [showMessagebaddata, setshowMessagebaddata] = React.useState(KaggleCredentialsState.ShowNothing)
    const onDrop = useCallback(
        (acceptedFiles) => {
            if (!consent) {
                setshowMessagebaddata(KaggleCredentialsState.MissingConsent)
                notify(Notificationstates.Error, "Please consent first")
                return
            }
            acceptedFiles.forEach((file: any) => {
                const reader = new FileReader()

                reader.onabort = () => console.log("file reading was aborted")
                reader.onerror = () => console.log("file reading has failed")
                reader.onload = async () => {
                    setshowMessagebaddata(KaggleCredentialsState.Loading)

                    const binaryStr: string | ArrayBuffer | null = reader.result

                    if (typeof binaryStr === "string") {
                        try {
                            const credentials: KaggleCredentials = JSON.parse(binaryStr)

                            if (await credentialsAuthorized(credentials.username, credentials.key)) {
                                onKaggleCredentials(credentials, rememberMe)
                            } else {
                                setshowMessagebaddata(KaggleCredentialsState.InvalidCredentials)
                            }
                        } catch (error) {
                            setshowMessagebaddata(KaggleCredentialsState.WrongFormat)
                            notify(Notificationstates.Error, "Login unsuccessul")
                        }
                    } else {
                        setshowMessagebaddata(KaggleCredentialsState.WrongFormat)
                        notify(Notificationstates.Error, "Login unsuccessul")
                    }
                }
                reader.readAsText(file)
            })
        },
        [rememberMe, onKaggleCredentials, setshowMessagebaddata, consent]
    )

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ".json" })

    const WrongFormat = () => (
        <p style={{ pointerEvents: "none", color: "#d6331a", fontSize: "1.6rem" }}>Your file was corrupted. Please try again :)</p>
    )
    const InvalidCredentials = () => (
        <p style={{ pointerEvents: "none", color: "#d6331a", fontSize: "1.3rem", textAlign: "center" }}>
            Login unsuccessul. You may need to update your Kaggle.json file.
        </p>
    )

    const Header = () => (
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
    )

    return (
        <div
            className="d-flex flex-column"
            style={{
                fontFamily:
                    "-sans-serif: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji",
            }}>
            <Header />
            <h2 style={{ textAlign: "center", color: "#3096a6" }}>Upload kaggle.json to Sign In</h2>
            <div className="container">
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
                <Container className="mt-0" style={{ cursor: "pointer" }} {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Upload kaggle.json here.</p>
                    {showMessagebaddata == KaggleCredentialsState.ShowNothing ? null : showMessagebaddata ==
                      KaggleCredentialsState.WrongFormat ? (
                        <WrongFormat />
                    ) : showMessagebaddata === KaggleCredentialsState.InvalidCredentials ? (
                        <InvalidCredentials />
                    ) : showMessagebaddata === KaggleCredentialsState.Loading ? (
                        <div className="p-3 d-flex justify-content-center">
                            <Loading>Logging in ...</Loading>
                        </div>
                    ) : (
                        <div>Missing Consent</div>
                    )}
                </Container>
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
