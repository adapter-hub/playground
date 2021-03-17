import React, { useCallback, useMemo, useState } from "react"
import { Accordion, Button, Card, Col, Collapse, Container, Fade, Form, Row } from "react-bootstrap"
import { useDropzone } from "react-dropzone"
import { useHistory } from "react-router-dom"
import styled from "styled-components"
import { CloudComputingAPI } from "../../api/cloudComputing/CloudComputingAPI"
import { KaggleCloudComputingAPI } from "../../api/cloudComputing/kaggle/KaggleCloudComputingAPI"
import { Notificationstates, notify } from "../../app"
import Footer from "../footer/footer"
import Toolbar from "../toolbar/toolbar"

export type QuestionAnswer = {
    question: string
    answerTop: string
    imagLink?: string
    answerBottom?: string
}

const DataQandA: QuestionAnswer[] = [
    {
        question: "What exactly is Adapterhub?",
        answerTop:
            "AdapterHub is a framework simplifying the integration, training and usage of adapter modules for Transformer-based language models.",
    },
    {
        question: "Why do I need to create a kaggle account?",
        answerTop:
            "Processing several hundred thousand text inputs via the adapterhub library can quickly overwhelm the computing power of a standard web server. To prevent any form of performance degradation, we decided to move all of the calculation to kaggle, where users can compute on their very own workbench. Creating your own kaggle account allows you to store and maintain your projects by yourself, independent of other users that use our site.",
    },
    {
        question: "How do I train Adapters?",
        answerTop:
            "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
    },
    {
        question: "How do I need to format my google sheet for sentiment analysis?",
        answerTop: "Format your google sheets similar to this image:",
        imagLink: "images/formatSentAnal.png",
        answerBottom:
            "A common problem when using our site is that your google sheets document may be loaded with too much data. To work around this problem, simply remove a few columns that should not be analyzed until the error is fixed. Also note that you specify which column to write the results to, so make sure that you don't overwrite any data you want to keep.",
    },
]

export function Faqpage() {
    const [toggleArray, setToggleArray] = useState<boolean[]>(
        Array.from(
            DataQandA.map(() => {
                return false
            })
        )
    )
    const history = useHistory()

    const Header = () => (
        <div
            className="jumbotron jumbotron-fluid py-lg-5 d-flex "
            style={{
                height: "132px",
                width: "100%",
                backgroundColor: "#39B3C6",
                color: "#f0f2f5",
                textAlign: "center",
                lineHeight: "1.5",
            }}>
            <Row style={{ width: "100%" }}>
                <Col sm={8} style={{ marginLeft: "10%", fontWeight: 500, fontSize: "3rem" }}>
                    Frequently Asked Questions
                </Col>
                <Col sm={2} onClick={() => history.push(`/`)} className="faq-home">
                    <img src="images/adapter-bert.png" className="bert" width="45" />
                    Home
                </Col>
            </Row>
        </div>
    )

    function QuestionAnswer({
        headerText,
        bodyText,
        indx,
        image,
        answerBottom,
    }: {
        headerText: string
        bodyText: string
        indx: number
        image?: string
        answerBottom?: string
    }) {
        return (
            <div>
                <Row>
                    <Col>
                        <div>
                            <div
                                className="faq-header d-flex flex-row align-items-center justify-content-between"
                                onClick={() =>
                                    setToggleArray(
                                        Array.from(
                                            toggleArray.map((element, index) => {
                                                return index == indx ? !element : element
                                            })
                                        )
                                    )
                                }
                                style={{
                                    alignContent: "center",
                                    borderBottom: "2px solid #424c69",
                                }}>
                                <div>{headerText}</div>
                                <div>
                                    {toggleArray[indx] ? (
                                        <i className="faq-icon fas fa-arrow-circle-up fa-lg"></i>
                                    ) : (
                                        <i className="faq-icon fas fa-arrow-circle-down fa-lg"></i>
                                    )}
                                </div>
                            </div>
                            <div className="row mt-3" />
                            <Collapse in={toggleArray[indx]} appear={true}>
                                <div>
                                    <div>{bodyText}</div>
                                    <div className="row mt-3" />
                                    {image ? (
                                        <div className="row d-flex justify-content-center">
                                            <img className="mr-3" style={{ border: "1px dotted black" }} src={image} />
                                        </div>
                                    ) : (
                                        <div />
                                    )}
                                    {answerBottom ? <div className="row mt-5"> {answerBottom}</div> : <div />}
                                </div>
                            </Collapse>
                        </div>
                    </Col>
                </Row>
                <div className="row mt-5"></div>
            </div>
        )
    }

    return (
        <div>
            <Header />
            <Container>
                <h3 className="mb-5" style={{ color: "#3096a6" }}>
                    To get some basic information about our project, please watch the following video:{" "}
                    <i className="fas fa-info-circle" style={{ fontSize: "0.7em", marginLeft: "8px" }}></i>
                </h3>
                <div className="row d-flex justify-content-center">
                    <div className="col-sm-8">
                        <div className="embed-responsive embed-responsive-16by9">
                            <iframe
                                src="https://www.youtube.com/embed/CI64rfCyfLg"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen></iframe>
                        </div>
                    </div>
                </div>
                <div className="row mt-5"></div>
                <div className="row mt-5"></div>
                <div className="row mt-5"></div>

                {DataQandA.map((questionAnswer, index) => {
                    return (
                        <QuestionAnswer
                            headerText={questionAnswer.question}
                            bodyText={questionAnswer.answerTop}
                            indx={index}
                            image={questionAnswer.imagLink}
                            key={index}
                            answerBottom={questionAnswer.answerBottom}
                        />
                    )
                })}
            </Container>
            <div className="row mt-5"></div>
        </div>
    )
}
