import React from "react"
import { toAbsoluteStaticFilePath } from "../toolbox"

export function PredictionExplanation() {
    return (
        <div>
            <h5>Example for „sentiment prediction</h5>
            <div className="d-flex flex-row p-5">
                <img className="mr-5" style={{ minWidth: 0 }} src="images/input.png" />
                <img style={{ minWidth: 0 }} src="images/with_output.png" />
            </div>
            <p>
                The left image shows the Google Sheets document before prediction. Each cell in the "Input1" column is a
                piece of text to be analyzed. "Input2" and "gold_label" are not relevant for the "Sentiment Analysis"
                and can be left empty.
            </p>
            <p>
                The right image shows the Google Sheets document after the prediction. The name of the column is the name
                of the job you created (see below). In the column you can see the results for the specific pieces of
                text in Input1.
            </p>
            <p>When formatting your Google Sheet, you must follow the rules below:</p>
            <p>Rules:</p>
            <p>
                1. The first three columns are fixed and must be included in the document even if your task does not
                require "Input2" or "gold_label". You can simply leave them empty, except for the heading.
            </p>
            <p>
                2. You can decide for each job in which column to write. Note that existing data in these columns will
                be overwritten, so make sure that the columns are empty. To avoid permanent data loss, we also recommend
                always backing up your data before starting a new session.
            </p>
            <p>
                3. All columns must have a heading. The first three columns must be named "Input1,Input2,gold_label".
                The heading for new jobs is inserted automatically and does not need to be inserted by you.
            </p>
            <p>
                4. If your data has further properties, you can add them in further columns in the document (e.g.
                "male", "female"). Of course, these have no influence on the result of the prediction, but can be useful
                for the later visualization we provide.
            </p>
            <p>
                5. Your data may contain time data, which is very useful for later visualization. If so, please make
                sure that the timestamps are in ISO format and the column name is "date".
            </p>
        </div>
    )
}
