import * as codeGen from "./code-generation"
import * as utils from "./utils"

export function generateCode(
    parameter: {
        taskType: string
        trainingDataset: string
        modelTransformerClass: string
        modelName: string
        sheetsAccessToken: string
        sheetsDocumentURL: string
    } & (
        | {
              doTraining: false
              sheetsColumnName: string
              name: string
          }
        | {
              doTraining: true
              learningRate: number
              numTrainEpochs: number
          }
    ) &
        (
            | {
                  useOwnAdapter: false
                  adapterArchitecture: string
                  adapterGroupName: string
                  nlpTaskType: string
              }
            | {
                  useOwnAdapter: true
                  zipFileName: string
              }
        )
): string {
    const inputType = utils.getInputType(parameter.taskType, parameter.trainingDataset)
    const pipeline = utils.findNeededPipeline(parameter.taskType, parameter.trainingDataset)
    const transDicAndGoldLabelTranslation = utils.checkTransDicAndGoldLabelTranslationOfTheTask(
        parameter.taskType,
        parameter.trainingDataset
    )
    const transDic = transDicAndGoldLabelTranslation[0]
    const goldLabelTranslation = transDicAndGoldLabelTranslation[1]

    const sharedStartSetupCode = codeGen.genSharedStartSetup(
        parameter.modelTransformerClass,
        parameter.modelName,
        parameter.doTraining,
        parameter.sheetsAccessToken,
        parameter.sheetsDocumentURL,
        inputType,
        goldLabelTranslation,
        pipeline,
        parameter.taskType === "sts" && parameter.trainingDataset === "sts-b"
    )
    let specificSetupCode
    if (parameter.useOwnAdapter) {
        specificSetupCode = codeGen.genLoadUserAdapter(
            `/kaggle/input/${parameter.zipFileName.split("/")[1]}/default`,
            parameter.taskType
        )
    } else {
        specificSetupCode = codeGen.genLoadAHAdapter(
            parameter.adapterArchitecture,
            parameter.taskType,
            parameter.trainingDataset,
            parameter.adapterGroupName,
            parameter.nlpTaskType
        )
    }

    const sharedEndSetupCode = codeGen.genSharedEndSetup(pipeline, transDic, parameter.doTraining)

    const setupCode = `${sharedStartSetupCode}
${specificSetupCode}
${sharedEndSetupCode}`

    let computationSpecificCode
    if (parameter.doTraining) {
        computationSpecificCode = codeGen.genTrainingSpecificCode(
            parameter.learningRate,
            parameter.numTrainEpochs,
            inputType
        )
    } else {
        computationSpecificCode = codeGen.genClassificationSpecificCode(
            parameter.sheetsColumnName,
            parameter.name,
            inputType
        )
    }
    const sharedFinalizeCode = codeGen.genSharedFinalizeCode(parameter.sheetsDocumentURL, parameter.doTraining)

    return `${setupCode}
${computationSpecificCode}
${sharedFinalizeCode}`
}
