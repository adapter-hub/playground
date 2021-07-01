import React from "react"
import { toAbsoluteStaticFilePath } from "../toolbox"

export function TrainingExplanation() {
    return (
        <div>
            <h5>Example for „sentiment prediction</h5>
            <div className="d-flex flex-row p-5">
                <img className="mr-5" style={{ minWidth: 0 }} src="images/training.png" />
            </div>
            <p>
                The image shows the Google Sheets document prepared for few shot training. "Input1" is used as the input and "gold_label" are the gold labels that the adapter will be trained to predict.
            </p>
            <p>When formatting your Google Sheet, you must follow the rules below:</p>
            <p>Rules:</p>
            <p>
                1. The first three columns are fixed and must be included in the document. For training "Input1" in the first column and "gold_label" in the third column are required.
            </p>
            <p>
                2. All columns must have a heading. The first three columns must be named "Input1,Input2,gold_label".
                The heading for new jobs is inserted automatically and does not need to be inserted by you.
            </p>
            <p>
                3. If your data has further properties, you can add them in further columns in the document (e.g. clustering or timestamps). Of course, these have no influence on the result of the prediction, but can be useful
                for the later visualization we provide.
            </p>
            <p>
                4. Your data may contain time data, which is very useful for later visualization. If so, please make
                sure that the timestamps are in ISO format and the column name is "date".
            </p>
        </div>
    )
}
