import * as IOHandling from "./IO-handling"
import * as training from "./training"
import * as setup from "./setup"
import * as errorHandling from "./error-handling"
import * as utils from "./utils"
import { PlatformType } from "../services"

export function genSharedStartSetup(
    platformType: PlatformType,
    modelTransformerClass: string,
    modelName: string,
    doTraining: boolean,
    sheetsAccessToken: string,
    sheetsDocumentURL: string,
    inputType: utils.InputType,
    goldLabelTranslation: string,
    pipeline: string,
    roundGoldLabels: boolean
): string {
    return `${setup.genKaggleOS(platformType)}
${setup.genExplainCode()}
${setup.genImportSheetConnectionPackages()}
${IOHandling.genInitializeSheetConnection(sheetsDocumentURL, sheetsAccessToken)}
${IOHandling.genReadInputFromSheet(inputType)}
${errorHandling.genFilterInvalidTextInputs(doTraining, inputType)}
${IOHandling.genReadGoldLabels(goldLabelTranslation, roundGoldLabels)}
${errorHandling.genFilterGoldLabels(doTraining, inputType)}
${errorHandling.genPossibleTerminate(doTraining)}
${setup.genInstallAH(platformType)}
${setup.genImportAHPackages(doTraining, pipeline, modelTransformerClass)}
${setup.genTokenizer(modelName)}
${setup.genLoadModel(modelName, modelTransformerClass)}`
}

export function genLoadUserAdapter(zipFileName: string, taskType: string): string {
    return `${IOHandling.genExtractAdapterFromUploadedZip(zipFileName)}
${IOHandling.genLoadAdapterFromUser()}`
}

export function genLoadAHAdapter(
    adapterArchitecture: string,
    taskType: string,
    trainingDataset: string,
    adapterGroupName: string,
    nlpTaskType: string
): string {
    return setup.genLoadAdapterFromAH(taskType, trainingDataset, adapterGroupName, nlpTaskType, adapterArchitecture)
}

export function genSharedEndSetup(pipeline: string, transDic: string, doTraining: boolean): string {
    return `${setup.genPipeline(pipeline)}
${setup.genCreateLabelTranslationDic(transDic)}
${setup.genPrepareAdapterOnModel(doTraining)}`
}

export function genTrainingSpecificCode(
    learningRate: number,
    numTrainEpochs: number,
    inputType: utils.InputType
): string {
    const twoInput = inputType == utils.InputType.TwoInputClassification
    return `${training.genUserDatasetClass()}
${training.genSetTrainingArgs(learningRate, numTrainEpochs)}
${training.genPrepareInputForIterativeTraining(twoInput)}
${training.genIterativeTraining(twoInput)}
${IOHandling.genSaveAdapter()}
${IOHandling.genZipTrainedAdapter()}
${setup.genIterativeClassification(true)}`
}

export function genClassificationSpecificCode(
    sheetsColumnName: string,
    newNameOfResultColumn: string,
    inputType: utils.InputType
): string {
    const doTraining = false
    return `${setup.genHackyInputTruncate(doTraining, inputType)}
${setup.genIterativeClassification(doTraining)}
${setup.genTranslateOutputLabels()}
${errorHandling.genPrepareResultsForSheet(inputType, newNameOfResultColumn)}
${IOHandling.genWriteOutputInSheet(sheetsColumnName)}`
}

export function genSharedFinalizeCode(sheetsLink: string, doTraining: boolean): string {
    return `${setup.genCalculateAccuracy(doTraining)}
${IOHandling.genStoreWarnings(doTraining)}
${IOHandling.genStoreMetadata(sheetsLink)}
${IOHandling.genDeleteUselessFiles()}`
}
