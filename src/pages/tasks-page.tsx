import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import { toAbsoluteStaticFilePath } from "../toolbox"
import { Toolbar } from "../components/toolbar"

export type TaskDetails = {
    title: string
    description: string
}

const TasksAndDescription: TaskDetails[] = [
    {
        title: "Sentiment Analysis",
        description:
            "Sentiment Analysis is the task of classifying the polarity of a given text.",
    },
    {
        title: "Semantic Textual Similarity",
        description:
            "Semantic textual similarity deals with determining how similar two pieces of texts are. This can take the form of assigning a score from 1 to 5. Related tasks are paraphrase or duplicate identification.",
    },    
    {
        title: "Linguistic Acceptability",
        description:
            "Task of judging the grammatical acceptability of a sentence, with the goal of testing their linguistic competence.",
    },
    {
        title: "Natural Language Inference",
        description:
            "Natural language inference is the task of determining whether a 'hypothesis' is true (entailment), false (contradiction), or undetermined (neutral) given a 'premise'.",
    },

]

export function Taskspage() {
    return (
        <div>
            <div className="jumbotron jumbotron-fluid d-flex align-items-center bg-primary justify-content-center p-4">
                <h2 className="text-white">Supported Tasks</h2>
            </div>
            <div className="container">


                {TasksAndDescription.map((taskDescription, index) => {
                    return (
                        <TaskDetails
                            headerText={taskDescription.title}
                            bodyText={taskDescription.description}
                            key={index}
                        />
                    )
                })}
                <h5>
                    If you encounter some errors or need additional help, please create an issue at{" "} 
                    <a href="https://github.com/Adapter-Hub/playground">the github repo.</a>
                </h5>
            </div>
            <div className="row mt-5"></div>
        </div>
    )
}

function TaskDetails({
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
                        </div>
                        <div className="row mt-3" />
                        <div>
                            <div>
                                <div>{bodyText}</div>
                                <div className="row mt-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mt-5"></div>
        </div>
    )
}
