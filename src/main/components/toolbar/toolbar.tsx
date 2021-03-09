import React, { Component, useContext } from "react"
import { Button } from "react-bootstrap"
import { CredentialsContext } from "../../app"

export default function Toolbar() {
    const { logout } = useContext(CredentialsContext)
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
                        <span className="align-middle">AdapterHub</span>
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation">
                        <i className="fas fa-bars text-dark" style={{ fontSize: "28" }}></i>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item nav-secondary justify-content-end d-none d-md-inline-block">
                                <a className="nav-link" href="https://github.com/adapter-hub">
                                    <i className="fab fa-github"></i>&nbsp;
                                </a>
                            </li>
                            <li className="nav-item nav-secondary justify-content-end d-none d-md-inline-block">
                                <a className="nav-link" href="https://twitter.com/adapterhub">
                                    <i className="fab fa-twitter"></i>&nbsp;
                                </a>
                            </li>
                            <li className="nav-item separator d-none d-md-inline-block"></li>
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
