import React, { useCallback, useMemo, useState } from "react"
import { Toolbar } from "./components/toolbar"
import { FooterComponent } from "./components/footer-component"
import { Faqpage } from "./pages/faq-page"
import "./custom.scss"
import { HashRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import { ProjectListPage } from "./pages/project-list-page"
import ProjectPage from "./pages/project-page"
import { useCheckAutenticationQuery } from "./api"
import { KaggleCredentials, LoginPage } from "./pages/login-page"
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import { LoadingComponent } from "./components/loading-component"
import { createUploadLink } from "apollo-upload-client"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function saveCredentials({ username, key }: KaggleCredentials, rememberMe: boolean) {
    if (rememberMe) {
        localStorage.setItem("username", username)
        localStorage.setItem("key", key)
    } else {
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("key", key)
    }
}

function deleteCredentials(): void {
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("key")
    localStorage.removeItem("username")
    localStorage.removeItem("key")
}

function getCredentials(): KaggleCredentials | undefined {
    const username = sessionStorage.getItem("username") ?? localStorage.getItem("username")
    const key = sessionStorage.getItem("key") ?? localStorage.getItem("key")
    if (key != null && username != null) {
        return {
            username,
            key,
        }
    } else {
        return undefined
    }
}

export function ClientApp() {
    const [credentials, setCredentials] = useState(() => getCredentials())
    const client = useMemo(
        () =>
            new ApolloClient({
                cache: new InMemoryCache(),
                link: createUploadLink({
                    uri: "https://bp2020.ukp.informatik.tu-darmstadt.de:1337/graphql",//"http://localhost:4000/graphql",
                    credentials: "same-origin",
                    headers:
                        credentials != null
                            ? {
                                  authorization: JSON.stringify(credentials),
                              }
                            : undefined,
                }),
            }),
        [credentials]
    )
    return (
        <ApolloProvider client={client}>
            <App setCredentials={setCredentials} />
        </ApolloProvider>
    )
}

export function App({ setCredentials }: { setCredentials: (credentials: KaggleCredentials | undefined) => void }) {
    const { data, loading } = useCheckAutenticationQuery({
        onCompleted: (data) => {
            if (data.checkAuthentication) {
                toast.success("successfully logged in")
            } else {
                toast.error("unable to login (wrong/expired token)")
            }
        },
    })
    const logout = useCallback(() => {
        deleteCredentials()
        setCredentials(undefined)
        toast.success("successfully logged out")
    }, [setCredentials])
    const login = useCallback(
        (credentials: KaggleCredentials, rememberMe: boolean) => {
            saveCredentials(credentials, rememberMe)
            setCredentials(credentials)
        },
        [setCredentials]
    )
    return (
        <div className="overflow-hidden">
            <ToastContainer />
            <div className="w-100 bg-secondary p-2 justify-content-end d-flex px-3 align-items-center">
                <span className="text-light">Beta Version</span>
                <i className="ml-2 text-light fa fa-info-circle"></i>
            </div>
            <Router>
                <Toolbar logout={logout} />
                {loading ? (
                    <LoadingComponent>Logging In</LoadingComponent>
                ) : data?.checkAuthentication ? (
                    <Switch>
                        <Route path={"/projects/:id"} render={(props) => <ProjectPage {...props} />}></Route>
                        <Route path="/projects">
                            <ProjectListPage />
                        </Route>
                        <Route path="/faq">
                            <Faqpage />
                        </Route>
                        <Route path="">
                            <Redirect to="/projects" />
                        </Route>
                    </Switch>
                ) : (
                    <LoginPage login={login} />
                )}
            </Router>
            <FooterComponent />
        </div>
    )
}
