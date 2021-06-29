import React, { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react"
import { Toolbar } from "./components/toolbar"
import { FooterComponent } from "./components/footer-component"
import { Faqpage } from "./pages/faq-page"
import "./custom.scss"
import { HashRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import { ProjectListPage } from "./pages/project-list-page"
import ProjectPage from "./pages/project-page"
import { useCheckAutenticationLazyQuery, useCheckAutenticationQuery } from "./api"
import { Credentials, LoginPage } from "./pages/login-page"
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import { LoadingComponent } from "./components/loading-component"
import { createUploadLink } from "apollo-upload-client"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { InfoComponent } from "./components/info-component"

function saveCredentials({ username, key, uri }: Credentials, rememberMe: boolean) {
    if (rememberMe) {
        localStorage.setItem("username", username)
        localStorage.setItem("key", key)
        localStorage.setItem("uri", uri)
    } else {
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("key", key)
        sessionStorage.setItem("uri", uri)
    }
}

function deleteCredentials(): void {
    localStorage.removeItem("username")
    localStorage.removeItem("key")
    localStorage.removeItem("uri")

    sessionStorage.removeItem("username")
    sessionStorage.removeItem("key")
    sessionStorage.removeItem("uri")
}

function getCredentials(): Credentials | undefined {
    const username = sessionStorage.getItem("username") ?? localStorage.getItem("username")
    const key = sessionStorage.getItem("key") ?? localStorage.getItem("key")
    const uri = sessionStorage.getItem("uri") ?? localStorage.getItem("uri")
    if (key != null && username != null && uri != null) {
        return {
            username,
            key,
            uri,
        }
    } else {
        return undefined
    }
}

export function ClientApp() {
    const [credentials, setCredentials] = useState(() => getCredentials())
    const client = useMemo(
        () =>
            credentials == null
                ? undefined
                : new ApolloClient({
                      cache: new InMemoryCache(),
                      link: createUploadLink({
                          uri: credentials.uri,
                          credentials: "same-origin",
                          headers: {
                              authorization: JSON.stringify({
                                  username: credentials.username,
                                  key: credentials.key,
                              }),
                          },
                      }),
                  }),
        [credentials]
    )

    if (client == null) {
        return <App tryLogin={false} setCredentials={setCredentials} />
    }

    return (
        <ApolloProvider client={client}>
            <App tryLogin={credentials != null} setCredentials={setCredentials} />
        </ApolloProvider>
    )
}

export function App({
    setCredentials,
    tryLogin,
}: {
    tryLogin: boolean
    setCredentials: (credentials: Credentials | undefined) => void
}) {
    const logout = useCallback(() => {
        deleteCredentials()
        setCredentials(undefined)
        toast.success("successfully logged out")
    }, [setCredentials])
    return (
        <div className="overflow-hidden">
            <ToastContainer />
            <div className="w-100 bg-secondary p-2 justify-content-end d-flex px-3 align-items-center">
                <span className="text-light">Alpha Version</span>
                <InfoComponent placement="left" color="white" text="The AdapterHub Playground is a research project and not intended for usage as a free web hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service (SaaS)." />
            </div>
            <Router>
                <Switch>
                    <Route
                        path={"/projects/:id"}
                        render={(props) => (
                            <AuthWrapper tryLogin={tryLogin} setCredentials={setCredentials}>
                                <Toolbar logout={logout} />
                                <ProjectPage {...props} />
                            </AuthWrapper>
                        )}></Route>
                    <Route path="/projects">
                        <AuthWrapper tryLogin={tryLogin} setCredentials={setCredentials}>
                            <Toolbar logout={logout} />
                            <ProjectListPage />
                        </AuthWrapper>
                    </Route>
                    <Route path="/faq">
                        <Toolbar />
                        <Faqpage />
                    </Route>
                    <Route path="">
                        <Redirect to="/projects" />
                    </Route>
                </Switch>
            </Router>
            <FooterComponent />
        </div>
    )
}

export function AuthWrapper({
    children,
    setCredentials,
    tryLogin,
}: PropsWithChildren<{
    setCredentials: (credentials: Credentials | undefined) => void
    tryLogin: boolean
}>) {
    const [checkAuthentication, { data, loading }] = useCheckAutenticationLazyQuery({
        onError: (error) => {
            toast.error(`unable to login (${error.message})`)
        },
        onCompleted: (data) => {
            if (data.checkAuthentication) {
                toast.success("successfully logged in")
            } else {
                toast.error("unable to login (wrong/expired token)")
            }
        },
    })

    useEffect(() => {
        if (tryLogin) {
            checkAuthentication()
        }
    }, [tryLogin])

    const login = useCallback(
        (credentials: Credentials, rememberMe: boolean) => {
            saveCredentials(credentials, rememberMe)
            setCredentials(credentials)
        },
        [setCredentials]
    )
    if (loading) {
        return <LoadingComponent>Logging In</LoadingComponent>
    } else if (data?.checkAuthentication) {
        return <div>{children}</div>
    } else {
        return (
            <div>
                <Toolbar />
                <LoginPage login={login} />
            </div>
        )
    }
}
