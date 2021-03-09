import * as fileHandling from "./file_handling"
import * as training from "./training"
import * as setup from "./setup"
import * as errorHandling from "./error_handling"
import * as helpers from "./helpfunctions"

export function genSharedSetupCode(
    taskType: string,
    trainingDataset: string,
    modelTransformerClass: string,
    adapterArchitecture: string,
    modelName: string,
    adapterGroupName: string,
    nlpTaskType: string,
    sheetsAccessToken: string,
    sheetsDocumentURL: string,
    inputSpecification: string,
    pipeline: string,
    transDic: string,
    goldLabelTranslation: string,
    doTraining: boolean
): string {
    //checking for strings is not good (no compiler support), enum should be made without string
    //error functions check with boolean which input type we have, thats why we create this here
    const twoInput = inputSpecification == "TwoInputClassification"
    return `
${setup.genKaggleFirstStepOs()}
${setup.genImportSheetConnectionPackages()}
${fileHandling.genInitializeSheetConnection(sheetsDocumentURL, sheetsAccessToken)}
${fileHandling.genReadInputFromSheet(inputSpecification)}
${errorHandling.genFilterInvalidTextInputs(doTraining, twoInput)}
${fileHandling.genReadGoldLabels(goldLabelTranslation)}
#-----------
#-----------------------------error handling---------------------------------------------------------------
${errorHandling.genFilterGoldLabels(doTraining, twoInput)}
${errorHandling.genPossibleTerminate(doTraining)}
#-----------
#-----------
${setup.genKaggleSecondStepOs()}
${setup.genImportRemainingPackages(doTraining, pipeline, modelTransformerClass)}
${setup.genTokenizer(modelName)}
${setup.genAdapterArchitecture(adapterArchitecture)}
${setup.genLoadPreTrainedModel(modelName, modelTransformerClass)}
${setup.genLoadAdapter(taskType, trainingDataset, adapterGroupName, nlpTaskType)}
${setup.genNeededPipeline(pipeline)}
${setup.genCreateLabelTranslationDic(transDic)}
${setup.genPrepareAdapterOnModel(doTraining)}`
}

export function genTrainingSpecificCode(
    learningRate: number,
    numTrainEpochs: number,
    inputSpecification: string
): string {
    return `
${training.genUserDatasetClass()}
${training.genSetTrainingArgs(learningRate, numTrainEpochs)}
${training.genPrepareInputForTraining(inputSpecification == "TwoInputClassification")}
${training.genPrepareTrainer()}
${training.genTrain()}
${training.genSaveAdapter()}
${setup.genPredictOutput(true)}
`
}

export function genClassificationSpecificCode(
    sheetsColumnName: string,
    newNameOfResultColumn: string,
    inputSpecification: string
): string {
    return `
${setup.genPredictOutput(false)}
${setup.genTranslateOutputLabels()}
${errorHandling.padResultsForEmptyInputs(inputSpecification == "TwoInputClassification", newNameOfResultColumn)}
${fileHandling.genWriteOutputInSheet(sheetsColumnName)}

`
}

export function genSharedFinalizeCode(sheetsLink: string, doTraining: boolean): string {
    return `
${setup.genCalculateAccuracy(doTraining)}
${fileHandling.genStoreWarnings(doTraining)}
${fileHandling.genStoreMetadata(sheetsLink)}
`
}

export function genCode(
    taskType: string,
    trainingDataset: string,
    modelTransformerClass: string,
    adapterArchitecture: string,
    modelName: string,
    adapterGroupName: string,
    nlpTaskType: string,
    sheetsAccessToken: string,
    sheetsDocumentURL: string,
    columnName: string,
    newNameOfResultColumn: string,
    inputSpecification: string,
    pipeline: string,
    transDic: string,
    goldLabelTranslation: string,
    doTraining: boolean,
    learningRate: number,
    numTrainEpochs: number
): string {
    let specificCode
    if (doTraining) {
        specificCode = genTrainingSpecificCode(learningRate, numTrainEpochs, inputSpecification)
    } else {
        specificCode = genClassificationSpecificCode(columnName, newNameOfResultColumn, inputSpecification)
    }
    return `
${genSharedSetupCode(
    taskType,
    trainingDataset,
    modelTransformerClass,
    adapterArchitecture,
    modelName,
    adapterGroupName,
    nlpTaskType,
    sheetsAccessToken,
    sheetsDocumentURL,
    inputSpecification,
    pipeline,
    transDic,
    goldLabelTranslation,
    doTraining
)}
${specificCode}
${genSharedFinalizeCode(sheetsDocumentURL, doTraining)}
 `
}
