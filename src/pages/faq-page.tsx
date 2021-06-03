import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import { toAbsoluteStaticFilePath } from "../toolbox"
import { Toolbar } from "../components/toolbar"

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
        question: "How to format the 'date' field?",
        answerTop:
            "We accept the most common format like ISO. You can use Google sheets to format your dates. Just follow the steps in the following picture.",
        imagLink: "images/formatDateSheets.png",
    },
    {
        question: "Some computations are loading endlessly. What to do?",
        answerTop:
            "If to many requests where issued to kaggle, kaggle will deny requests for a certain time window. Try reloading the page or close the page and wait a short time so kaggle stops blocking your requests.",
    },
    {
        question: "How do I train Adapters?",
        answerTop:
            "When adding a task to a project you can select 'training' as task type. Training requires the 'gold_label' column to be filled with correct labels (e.g. 'positive'/'negative' for sentiment analysis).",
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
    return (
        <div>
            <Toolbar />
            <div className="jumbotron jumbotron-fluid d-flex align-items-center bg-primary justify-content-center p-4">
                <h2 className="text-white">Frequently Asked Questions</h2>
            </div>
            <div className="container">
                <h3 className="mb-5" style={{ color: "#3096a6" }}>
                    Adapter Hub Playground Introduction
                    <i className="fas fa-info-circle" style={{ fontSize: "0.7em", marginLeft: "8px" }}></i>
                </h3>
                <div className="row d-flex justify-content-center mb-5">
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

                {DataQandA.map((questionAnswer, index) => {
                    return (
                        <QuestionAnswer
                            headerText={questionAnswer.question}
                            bodyText={questionAnswer.answerTop}
                            image={questionAnswer.imagLink}
                            key={index}
                            answerBottom={questionAnswer.answerBottom}
                        />
                    )
                })}
                <h5>
                    If you encounter some errors or need additional help please use write create a Issue at{" "}
                    <a href="https://github.com/Adapter-Hub/playground">the github repo.</a>
                </h5>
            </div>
            <div className="row mt-5"></div>
        </div>
    )
}

function QuestionAnswer({
    headerText,
    bodyText,
    image,
    answerBottom,
}: {
    headerText: string
    bodyText: string
    image?: string
    answerBottom?: string
}) {
    const [open, setOpen] = useState(false)
    return (
        <div>
            <div className="row">
                <div className="row">
                    <div>
                        <div
                            className="faq-header d-flex flex-row align-items-center justify-content-between"
                            onClick={() => setOpen(!open)}
                            style={{
                                alignContent: "center",
                                borderBottom: "2px solid #424c69",
                            }}>
                            <div>{headerText}</div>
                            <div>
                                <i
                                    className={
                                        open
                                            ? "faq-icon fas fa-arrow-circle-up fa-lg"
                                            : "faq-icon fas fa-arrow-circle-down fa-lg"
                                    }></i>
                            </div>
                        </div>
                        <div className="row mt-3" />
                        <div>
                            <div>
                                <div>{bodyText}</div>
                                <div className="row mt-3" />
                                {image ? (
                                    <div className="row d-flex justify-content-center">
                                        <img
                                            className="mr-3"
                                            style={{ maxWidth: "90%", border: "1px dotted black" }}
                                            src={image}
                                        />
                                    </div>
                                ) : (
                                    <div />
                                )}
                                {answerBottom ? <div className="row mt-5"> {answerBottom}</div> : <div />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mt-5"></div>
        </div>
    )
}
