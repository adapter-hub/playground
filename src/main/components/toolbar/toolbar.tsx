import React, { Component, useContext, useState } from "react"
import { Button } from "react-bootstrap"
import { CredentialsContext } from "../../app"

export default function Toolbar() {
    const { logout } = useContext(CredentialsContext)
    const [open, setOpen] = useState(false)
    return (
        <div>
            <nav className="navbar navbar-expand-md navbar-light bg-light">
                <div className="container">
                    <a className="navbar-brand p-0" href="/">
                        <img
                            src="/images/adapter-bert.png"
                            className="bert"
                            width="28"
                            style={{ marginRight: "15px" }}
                        />
                        <span className="align-middle">AdapterHub Playground</span>
                    </a>
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
                                variant="outline-light"
                                onClick={() => window.open("/faq", "_blank")}>
                                <a>
                                    Faq <i className="fa fa-question-circle" aria-hidden="true"></i>
                                </a>
                            </Button>
                            <Button
                                className="nav-item nav-secondary my-1 d-md-inline-block Toolbar-TutorialButton"
                                size="sm"
                                variant="outline-light"
                                onClick={() => window.open("https://youtu.be/B1n1SbQkNsA", "_blank")}>
                                <a>
                                    Tutorial <i className="fab fa-youtube fa-lg"></i>&nbsp;
                                </a>
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
                            <Button variant="danger" onClick={logout}>
                                Logout
                            </Button>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}
