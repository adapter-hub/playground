import React, { useContext, useState } from "react"
import { Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { CredentialsContext } from "../../app"
import { toAbsoluteStaticFilePath } from "../../toolbox"

export function ToolbarWithLogout() {
    const { logout } = useContext(CredentialsContext)
    return <Toolbar logout={logout} />
}

export default function Toolbar({ logout }: { logout?: () => void }) {
    const [open, setOpen] = useState(false)
    return (
        <div>
            <nav className="navbar navbar-expand-md navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand p-0" to="/">
                        <img
                            src={toAbsoluteStaticFilePath("images/adapter-bert.png")}
                            className="bert"
                            width="28"
                            style={{ marginRight: "15px" }}
                        />
                        <span className="align-middle">AdapterHub Playground</span>
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                        onClick={() => setOpen(!open)}>
                        <i className="fas fa-bars text-dark" style={{ fontSize: "28" }}></i>
                    </button>
                    <div className={`${open ? "" : "collapse"} navbar-collapse`} id="navbarNav">
                        <ul className="navbar-nav ml-auto">
                            <Button
                                className="nav-item nav-secondary my-1 d-md-inline-block Toolbar-TutorialButton"
                                size="sm"
                                as={Link}
                                target="_blank"
                                to="/faq"
                                variant="outline-light">
                                Faq <i className="fa fa-question-circle" aria-hidden="true"></i>
                            </Button>
                            <Button
                                className="nav-item nav-secondary my-1 d-md-inline-block Toolbar-TutorialButton"
                                size="sm"
                                variant="outline-light"
                                as="a"
                                href="https://youtu.be/B1n1SbQkNsA"
                                target="_blank">
                                Tutorial <i className="fab fa-youtube fa-lg"></i>&nbsp;
                            </Button>
                            <li className="nav-item nav-secondary justify-content-end d-md-inline-block">
                                <a
                                    target="_BLANK"
                                    className="text-center nav-link"
                                    href="https://github.com/adapter-hub">
                                    <i className="fab fa-github"></i>&nbsp;
                                </a>
                            </li>
                            <li className="nav-item nav-secondary justify-content-end d-md-inline-block">
                                <a
                                    target="_BLANK"
                                    className="text-center nav-link"
                                    href="https://twitter.com/adapterhub">
                                    <i className="fab fa-twitter"></i>&nbsp;
                                </a>
                            </li>
                            <li className="nav-item separator d-md-inline-block"></li>
                            {logout && (
                                <Button variant="danger" onClick={logout}>
                                    Logout
                                </Button>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}
