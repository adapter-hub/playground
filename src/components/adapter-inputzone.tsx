import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { AdapterParseService } from "../adapter-parse-service"
import { AdapterConfig } from "./adapterhub-adapter-config"
import { LoadingComponent } from "./loading-component"

export function AdapterInputzone({
    adapterConfig,
    setAdapterConfig,
}: {
    adapterConfig: AdapterConfig | undefined
    setAdapterConfig: (adapterConfig: AdapterConfig) => void
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>()

    const onDrop = useCallback(
        (acceptedFiles) => {
            acceptedFiles.forEach((file: any) => {
                const reader = new FileReader()

                setLoading(true)

                reader.onload = async () => {
                    const binaryData = reader.result

                    if (typeof binaryData === "object" && binaryData != null) {
                        try {
                            const adapterParser = new AdapterParseService()
                            const adapterConfig = await adapterParser.getAdapterConfig(binaryData)

                            setLoading(false)
                            setError(undefined)
                            setAdapterConfig(adapterConfig)
                        } catch (error) {
                            setError(error.message)
                        }
                    } else {
                        setError("unable to read file")
                    }
                }
                reader.readAsArrayBuffer(file)
            })
        },
        [setAdapterConfig, setLoading, setError]
    )

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ".zip" })

    return (
        <div
            className="bg-primary h5 mb-3 p-2 rounded-pill shadow-sm text-center text-white"
            style={{ cursor: "pointer" }}
            {...getRootProps()}>
            <input {...getInputProps()} />
            {error ? (
                <div className="text-danger">{error}</div>
            ) : loading ? (
                <LoadingComponent white>Loading Adapter</LoadingComponent>
            ) : adapterConfig == null ? (
                "Select Adapter"
            ) : (
                `Selected Adapter: ${adapterConfig.adapterName}`
            )}
        </div>
    )
}
