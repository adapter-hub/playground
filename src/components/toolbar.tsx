import React, { useState } from "react"
import { Link } from "react-router-dom"
import { toAbsoluteStaticFilePath } from "../toolbox"

export function Toolbar({ logout }: { logout?: () => void }) {
    const [open, setOpen] = useState(false)
    return (
        <div>
            <nav className="navbar navbar-expand-md navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand p-0" to="/">
                        <img
                            src="images/adapter-bert.png"
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
                            <Link
                                className="nav-item nav-secondary my-1 d-md-inline-block Toolbar-TutorialButton btn btn-sm btn-outline-light"
                                target="_blank"
                                to="/faq">
                                Faq <i className="fa fa-question-circle" aria-hidden="true"></i>
                            </Link>
                            <a
                                className="nav-item nav-secondary my-1 d-md-inline-block Toolbar-TutorialButton btn btn-sm btn-outline-light"
                                href="https://arxiv.org/abs/2108.08103"
                                target="_blank">
                                Paper <i className="fa fa-scroll"></i>&nbsp;
                            </a>
                            <a
                                className="nav-item nav-secondary my-1 d-md-inline-block Toolbar-TutorialButton btn btn-sm btn-outline-light"
                                href="https://youtu.be/RvGviBe4N5Q"
                                target="_blank">
                                Demonstration <i className="fab fa-youtube fa-lg"></i>&nbsp;
                            </a>
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
                                <div className="btn btn-danger" onClick={logout}>
                                    Logout
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}
