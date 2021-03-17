import styled from "styled-components"
import { KaggleCredentials } from "./inputzone"
import React, { useCallback, useState } from "react"
import { Notificationstates, notify } from "../../app"
import { useDropzone } from "react-dropzone"
import { AdapterConfig, AdapterParseService } from "../../services/adapter-parse-service"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"

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
    margin-bottom: 3%;
    margin-top: 4%;
    margin-left: 25%;
    margin-right: 25%;
    font-size: x-large;
`

export function AdapterInputzone({
    client,
    onAdapterUploaded,
}: {
    client: CloudComputingAPI
    onAdapterUploaded: (config: AdapterConfig & { filename: string }) => void
}) {
    const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined)

    const [showMessagebaddata, setshowMessagebaddata] = React.useState(false)

    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file: any) => {
            const reader = new FileReader()

            reader.onabort = () => console.log("file reading was aborted")
            reader.onerror = () => console.log("file reading has failed")
            reader.onload = async () => {
                const binaryData: string | ArrayBuffer | null = reader.result

                if (typeof binaryData === "object" && binaryData != null) {
                    try {
                        const adapterParser = new AdapterParseService()
                        const adapterConfig = await adapterParser.getAdapterConfig(binaryData)

                        const filename = (await client.uploadFile(adapterConfig.data, setUploadProgress)) as string

                        onAdapterUploaded({
                            ...adapterConfig,
                            filename,
                        })
                    } catch (error) {
                        setshowMessagebaddata(true)
                    }
                } else {
                    setshowMessagebaddata(true)
                }
            }
            reader.readAsArrayBuffer(file)
        })
    }, [])

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ".zip" })

    const WrongData = () => (
        <p style={{ color: "#d6331a", fontSize: "1.6rem" }}>Your file was corrupted. Please try again :)</p>
    )

    return (
        <div className="container">
            {uploadProgress === 1 ? (
                <div className="text-success">Adapter was uploaded</div>
            ) : uploadProgress == null ? (
                <Container style={{ cursor: "pointer" }} {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Upload your adapter here.</p>
                    {showMessagebaddata ? <WrongData /> : null}
                </Container>
            ) : (
                <div className="progress">
                    <div
                        style={{ width: `${(uploadProgress * 100).toFixed(2)}%` }}
                        className="progress-bar"
                        role="progressbar"></div>
                </div>
            )}
        </div>
    )
}
function onAdapterUploaded(adapterConfig: any) {
    throw new Error("Function not implemented.")
}
