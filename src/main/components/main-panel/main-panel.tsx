import React, { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Link, Redirect, RouteChildrenProps } from "react-router-dom"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"
import { KaggleCloudComputingAPI } from "../../api/cloudComputing/kaggle/KaggleCloudComputingAPI"
import { CloudComputingKernel } from "../../api/cloudComputing/models/CloudComputingKernel"
import { CloudComputingKernelType } from "../../api/cloudComputing/models/CloudComputingKernelType"
import { GSpreadAPI } from "../../api/gSpread/GSpreadAPI"
import { GSpreadSpreadSheetAPI } from "../../api/spreadSheet/gSpread/GSpreadSpreadSheetAPI"
import { CredentialsContext } from "../../app"
import { useProject } from "../../services/project-service"
import { VisualizationResultPage } from "../analyse-result-page/visualization-result-panel"
import { KernelPage } from "../kernel-page/kernel-page"
import Loading from "../loading/loading"

type ResultState =
    | {
          loading: true
      }
    | {
          loading: false
          results: Array<Array<string>>
      }

type KernelsState =
    | {
          loading: true
      }
    | {
          loading: false
          kernels: Array<CloudComputingKernel | undefined>
      }

export type Adapter = {
    modelName: string
    type: string
    modelTransformerClass: string
    architecture: string
    groupname: string
    nlpTaskType: string
}

export default function MainPanel({ match, location }: RouteChildrenProps<{ name: string; sheetIdHash: string }>) {
    if (match == null) {
        //TODO make notification
        return <Redirect to="/projects" />
    }

    const { sheetIdHash, name } = match.params

    const [sheetLinkFromProject, setSheetLinkFromProject] = useState<string | undefined>(undefined)

    const { loading: loadingProject, project } = useProject(sheetIdHash, name)

    useEffect(() => {
        if (project != null) {
            project.getSheetsId().then(setSheetLinkFromProject)
        }
    }, [project])

    const { credentials } = useContext(CredentialsContext)

    const googleSheetClient = useMemo(() => new GSpreadSpreadSheetAPI(), [])

    const client: CloudComputingAPI = useMemo(
        () => new KaggleCloudComputingAPI(credentials.username, credentials.key),
        []
    )

    const existingKernels = useMemo(() => project?.getKernels().map((kernel) => kernel.kernel) ?? [], [project])
    const [addedKernels, setAddedKernels] = useState<Array<CloudComputingKernel | undefined>>([])

    const kernels = useMemo(() => [...existingKernels, ...addedKernels], [existingKernels, addedKernels])

    const [resultState, setResultState] = useState<ResultState>({
        loading: true,
    })

    const addTask = useCallback(() => {
        setAddedKernels([...addedKernels, undefined])
    }, [setAddedKernels, addedKernels])

    const sheetLink = useMemo(() => {
        if (sheetLinkFromProject != null) {
            return sheetLinkFromProject
        } else {
            const searchParams = new URLSearchParams(location.search)
            return searchParams.get("sheetLink")
        }
    }, [location.search, sheetLinkFromProject])

    const reloadData = useCallback(() => {
        if (sheetLink == null || !googleSheetClient.linkMatchesRegex(sheetLink)) {
            //TODO
            return
        }
        googleSheetClient
            .getSpreadSheetAsCSV(googleSheetClient.linkToSpreadSheet(sheetLink))
            .then((results) =>
                setResultState({
                    loading: false,
                    results,
                })
            )
            .catch((error) => {
                //TODO
            })
    }, [sheetLink, googleSheetClient, setResultState])

    useEffect(() => {
        reloadData()
    }, [sheetLink])

    return (
        <div className="d-flex flex-column container">
            <div className="m-3 d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex flex-row align-items-center">
                    <Link className="btn btn-primary" to={"/"}>
                        &lt; Back
                    </Link>
                    <h1 className="m-0 ml-3">Project: {name}</h1>
                </div>
                {sheetLink != null && (
                    <a className="h4 m-0 ml-3" target="_blank" href={sheetLink}>
                        Google Sheet Link
                    </a>
                )}
            </div>
            {loadingProject || sheetLink == null ? (
                <div className="d-flex flex-column align-items-center mb-3 mt-3">
                    <Loading>Loading Tasks</Loading>
                </div>
            ) : (
                <div className="mb-3">
                    <h1>Tasks</h1>
                    {kernels.map((kernel, index) => (
                        <KernelPage
                            key={index}
                            projectName={name}
                            client={client}
                            gspread={sheetLink}
                            kernel={kernel}
                            onChangedOutput={() => reloadData()}
                        />
                    ))}
                    <button onClick={() => addTask()} className="btn btn-primary mb-3">
                        Add Task
                    </button>
                </div>
            )}
            <div className="mb-3">
                <div className="d-flex flex-row align-items-center">
                    <h1 className="m-0">Results</h1>
                    <button onClick={() => reloadData()} className="btn ml-3 btn-outline-primary">
                        Reload
                    </button>
                </div>
                <VisualizationResultPage
                    loading={resultState.loading}
                    response={resultState.loading ? undefined : (resultState.results as any)}></VisualizationResultPage>
            </div>
        </div>
    )
}
