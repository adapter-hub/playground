import React, { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react"
import Toolbar from "./components/toolbar/toolbar"
import Footer from "./components/footer/footer"
import MainPanel from "./components/main-panel/main-panel"
import { Inputzone } from "./components/inputzone/inputzone"
import { KaggleCredentials } from "./components/inputzone/inputzone"
import { ProjectList } from "./components/project-list/project-list"
import { Faqpage } from "./components/faq-page/faq-page"
import "./custom.scss"
import { ToastContainer, toast, ToastOptions } from "react-toastify"
import "react-toastify/scss/main.scss"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    RouteChildrenProps,
    useLocation,
    useHistory,
} from "react-router-dom"
import { ProjectServiceProvider } from "./services/project-service"
import { CloudComputingAPI } from "./api/cloudComputing/CloudComputingAPI"
import { KaggleCloudComputingAPI } from "./api/cloudComputing/kaggle/KaggleCloudComputingAPI"
import Loading from "./components/loading/loading"
import ReactTooltip from "react-tooltip"

export enum Notificationstates {
    Info,
    Success,
    Error,
    Warning,
    Default,
    Dark,
}

export async function credentialsAuthorized(username: string, key: string): Promise<boolean> {
    const client: CloudComputingAPI = new KaggleCloudComputingAPI(username, key)
    const credentials = await client.authorizeCredentials()

    if (credentials.isAuthorized) {
        return true
    } else {
        return false
    }
}

async function getKaggleCredentials(): Promise<KaggleCredentials | undefined> {
    const localusername = localStorage.getItem("username")
    const localkey = localStorage.getItem("key")
    const sessionusername = sessionStorage.getItem("username")
    const sessionkey = sessionStorage.getItem("key")

    if (localusername != null && localkey != null) {
        if (await credentialsAuthorized(localusername, localkey)) {
            return { username: localusername, key: localkey }
        } else {
            deleteKaggleCredentials()
            return undefined
        }
    } else if (sessionusername != null && sessionkey != null) {
        if (await credentialsAuthorized(sessionusername, sessionkey)) {
            return { username: sessionusername, key: sessionkey }
        } else {
            deleteKaggleCredentials()
            return undefined
        }
    } else {
        return undefined
    }
}

function saveKaggleCredentials({ username, key }: KaggleCredentials, rememberMe: boolean) {
    if (rememberMe) {
        localStorage.setItem("username", username)
        localStorage.setItem("key", key)
    } else {
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("key", key)
    }
}

function deleteKaggleCredentials(): void {
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("key")
    localStorage.removeItem("username")
    localStorage.removeItem("key")
}

export function notify(type: Notificationstates, message: string): void {
    const toastarguments: ToastOptions = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    }

    switch (type) {
        case Notificationstates.Dark: {
            toast.dark(message, toastarguments)
            break
        }
        case Notificationstates.Default: {
            toast(message, toastarguments)
            break
        }
        case Notificationstates.Error: {
            toast.error(message, toastarguments)
            break
        }
        case Notificationstates.Info: {
            toast.info(message, toastarguments)
            break
        }
        case Notificationstates.Success: {
            toast.success(message, toastarguments)
            break
        }
        case Notificationstates.Warning: {
            toast.warning(message, toastarguments)
            break
        }
    }
}

export const CredentialsContext = createContext<{ credentials: KaggleCredentials; logout: () => void }>(null as any)

export function CredentialsWrapper({ children }: PropsWithChildren<any>) {
    const [credentials, setCredentials] = useState<KaggleCredentials | undefined>(undefined)

    const [loading, setLoading] = useState(false)

    const loadCredentials = useCallback(async () => {
        setLoading(true)
        const e = await getKaggleCredentials()
        setLoading(false)
        setCredentials(e)
    }, [setCredentials])

    useEffect(() => {
        loadCredentials()
    }, [loadCredentials])

    if (loading) {
        return (
            <div className="p-3 d-flex justify-content-center">
                <Loading>Logging in ...</Loading>
            </div>
        )
    }

    if (credentials != null) {
        return (
            <CredentialsContext.Provider
                value={{
                    credentials,
                    logout: () => {
                        deleteKaggleCredentials()
                        setCredentials(undefined)
                        notify(Notificationstates.Success, "Logout successul")
                    },
                }}>
                <ProjectServiceProvider>{children}</ProjectServiceProvider>
            </CredentialsContext.Provider>
        )
    } else {
        return (
            <Router>
                <Switch>
                    <Route path="/faq">
                        <Faqpage />
                    </Route>
                    <Route path="">
                        <Inputzone
                            onKaggleCredentials={(credentials, rememberMe) => {
                                saveKaggleCredentials(credentials, rememberMe)
                                loadCredentials()
                            }}
                        />
                    </Route>
                </Switch>
                <Footer />
            </Router>
        )
    }
}

export function App() {
    return (
        <div className="overflow-hidden">
            <div className="w-100 bg-secondary p-2 justify-content-end d-flex px-3 align-items-center">
                <span className="text-light">Beta Version</span>
                <i className="ml-2 text-light fa fa-info-circle"></i>
            </div>
            <ToastContainer />
            <ReactTooltip id="main" />
            <CredentialsWrapper>
                <Router>
                    <Switch>
                        <Route
                            path={"/projects/:name/:sheetIdHash"}
                            render={(props) => (
                                <div>
                                    <Toolbar />
                                    <MainPanel {...props} />
                                </div>
                            )}></Route>
                        <Route path="/projects">
                            <div>
                                <Toolbar />
                                <ProjectList />
                            </div>
                        </Route>
                        <Route path="/faq">
                            <Faqpage />
                        </Route>
                        <Route path="">
                            <Redirect to="/projects" />
                        </Route>
                    </Switch>
                </Router>
                <Footer />
            </CredentialsWrapper>
        </div>
    )
}
