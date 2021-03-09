import * as codeGen from "./codeGeneration"
import * as helpFunctions from "./helpfunctions"

export function generateCodeNew(
    parameter: {
        taskType: string
        trainingDataset: string
        modelTransformerClass: string
        adapterArchitecture: string
        modelName: string
        adapterGroupName: string
        nlpTaskType: string
        sheetsAccessToken: string
        sheetsDocumentURL: string
    } & (
        | {
              doTraining: false
              sheetsColumnName: string
              newNameOfResultColumn: string
          }
        | {
              doTraining: true
              learningRate: number
              numTrainEpochs: number
          }
    )
): string {
    const inputSpecification = helpFunctions.checkIfTheTaskNeedOneOrTwoInputData(
        parameter.taskType,
        parameter.trainingDataset
    )
    const pipeline = helpFunctions.findNeededPipeline(parameter.taskType, parameter.trainingDataset)
    const transDicAndGoldLabelTranslation = helpFunctions.checkTransDicAndGoldLabelTranslationOfTheTask(
        parameter.taskType,
        parameter.trainingDataset
    )
    const transDic = transDicAndGoldLabelTranslation[0]
    const goldLabelTranslation = transDicAndGoldLabelTranslation[1]

    const sharedSetupCode = codeGen.genSharedSetupCode(
        parameter.taskType,
        parameter.trainingDataset,
        parameter.modelTransformerClass,
        parameter.adapterArchitecture,
        parameter.modelName,
        parameter.adapterGroupName,
        parameter.nlpTaskType,
        parameter.sheetsAccessToken,
        parameter.sheetsDocumentURL,
        inputSpecification,
        pipeline,
        transDic,
        goldLabelTranslation,
        parameter.doTraining
    )
    let specificCode
    if (parameter.doTraining) {
        specificCode = codeGen.genTrainingSpecificCode(
            parameter.learningRate,
            parameter.numTrainEpochs,
            inputSpecification
        )
    } else {
        specificCode = codeGen.genClassificationSpecificCode(
            parameter.sheetsColumnName,
            parameter.newNameOfResultColumn,
            inputSpecification
        )
    }
    const sharedFinalizeCode = codeGen.genSharedFinalizeCode(parameter.sheetsDocumentURL, parameter.doTraining)

    return `
${sharedSetupCode}
${specificCode}
${sharedFinalizeCode}`
}

export function generateCode(parameter: {
    taskType: string
    trainingDataset: string
    modelTransformerClass: string
    adapterArchitecture: string
    modelName: string
    adapterGroupName: string
    nlpTaskType: string
    sheetsAccessToken: string
    sheetsDocumentURL: string
    sheetsColumnName: string
    newNameOfResultColumn: string
    doTraining: true
    learningRate: number
    numTrainEpochs: number
}): string {
    const myDoTrainingForTesting = true
    const myLearningRateForTesting = 0.0001
    const myNumTrainEpochsForTesting = 3

    console.log(parameter.newNameOfResultColumn)
    console.log(parameter.sheetsColumnName)

    const inputSpecification = helpFunctions.checkIfTheTaskNeedOneOrTwoInputData(
        parameter.taskType,
        parameter.trainingDataset
    )
    const pipeline = helpFunctions.findNeededPipeline(parameter.taskType, parameter.trainingDataset)
    const transDicAndGoldLabelTranslation = helpFunctions.checkTransDicAndGoldLabelTranslationOfTheTask(
        parameter.taskType,
        parameter.trainingDataset
    )
    const transDic = transDicAndGoldLabelTranslation[0]
    const goldLabelTranslation = transDicAndGoldLabelTranslation[1]
    return `
${codeGen.genCode(
    parameter.taskType,
    parameter.trainingDataset,
    parameter.modelTransformerClass,
    parameter.adapterArchitecture,
    parameter.modelName,
    parameter.adapterGroupName,
    parameter.nlpTaskType,
    parameter.sheetsAccessToken,
    parameter.sheetsDocumentURL,
    parameter.sheetsColumnName,
    parameter.newNameOfResultColumn,
    inputSpecification,
    pipeline,
    transDic,
    goldLabelTranslation,
    myDoTrainingForTesting,
    myLearningRateForTesting,
    myNumTrainEpochsForTesting
)}`
}
