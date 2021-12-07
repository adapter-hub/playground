import { PlatformType } from "../services"
import * as training from "./training"
import * as utils from "./utils"

export function genKaggleOS(platformType: PlatformType): string {
    if (platformType === "kaggle") {
        return `import os
os.system('pip uninstall -y transformers')
os.system('pip uninstall -y typing')
os.system('pip uninstall -y tokenizers')
os.system('pip uninstall -y sacremoses')
os.system('pip install gspread oauth2client')`
    }
    return ""
}

export function genInstallAH(platformType: PlatformType): string {
    if (platformType === "kaggle") {
        return `
#------------------------------------------------------------PART 2------------------------------------------------------------
os.system('pip install git+https://github.com/adapter-hub/adapter-transformers.git')`
    }
    return ""
}

export function genExplainCode(): string {
    return `
"""
---Introduction to the code design--- 
The code is basically structured into 3 parts, which all are marked to make it 
easier to understand it. The parts are:
1.: read and process data from google sheets
2.: load computation devices from adapterhub and perform the classification or training
3.: return the result, calculate accuracy and generate warnings
"""`
}

export function genImportSheetConnectionPackages(): string {
    return `
#------------------------------------------------------------PART 1------------------------------------------------------------
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json`
}

export function genImportAHPackages(doTraining: boolean, pipeline: string, modelTransformersClass: string): string {
    const sharedRemainingPackages = `import torch
from transformers import AutoTokenizer,AdapterConfig,AutoModelWithHeads
from transformers import ${pipeline}`

    if (doTraining) {
        return `${sharedRemainingPackages}
${training.genImportTrainingPackages()}`
    } else {
        return `${sharedRemainingPackages}`
    }
}

export function genTokenizer(modelName: string): string {
    return `
# load pre-trained tokenizer from Huggingface
tokenizer = AutoTokenizer.from_pretrained('${modelName}')`
}

export function genLoadModel(modelName: string, modelTransformersClass: string): string {
    return `
# load pre-trained model from Huggingface
model = AutoModelWithHeads.from_pretrained('${modelName}')`
}

export function genAdapterArchitecture(adapterArchitecture: string): string {
    return `
# get an adapter architecture from AdapterHub
config = `
}

export function genLoadAdapterFromAH(
    taskType: string,
    trainingDataset: string,
    adapterGroupName: string,
    nlpTaskType: string,
    adapterArchitecture: string
): string {
    const adapterId = `${taskType}/${trainingDataset}@${adapterGroupName}`
    return `
# load pre-trained text_task adapter from Adapter Hub
# this method call will also load a pre-trained classification head for the adapter task
adapter_name = model.load_adapter("${adapterId}","${adapterArchitecture}")`
}

export function genPipeline(pipeline: string): string {
    return `
# for classification the huggingface pipeline construct is used
pipeline = ${pipeline}(model=model,tokenizer=tokenizer,device=0)`
}

export function genCreateLabelTranslationDic(transDic: string): string {
    return `
# dictionary to map outputs of the pipeline ("Label_X") to more meaningfull, context depending names
transDic = {${transDic}}`
}

export function genPrepareAdapterOnModel(doTraining: boolean): string {
    let freezeModelWeights = ``
    if (doTraining) {
        freezeModelWeights = `
# prepare adapter and model for the training by freezing weights of model
model.train_adapter(adapter_name)`
    }
    return `${freezeModelWeights}

# activate the adapter for classification
model.set_active_adapters([adapter_name])`
}

export function genIterativeClassification(doTraining: boolean): string {
    const sizePerIteration = 300 //this is only an estimation based on manuel tests on Kaggle which is chosen rather too low, still could be sometimes too high
    const nameOfToClassifyDataSet = doTraining ? "labeled_texts" : "valid_input_data"
    return `
# classification is done in iterations in order to not exceed memory limit on Kaggle
outputs = []
length_of_to_classify_data = len(${nameOfToClassifyDataSet})
# could be tried to set higher if you´re input data is small (however program might not run on Kaggle then)
size_per_iteration = ${sizePerIteration}
for i in range(0, length_of_to_classify_data, size_per_iteration):
    classify_range_end = min([i+size_per_iteration, length_of_to_classify_data])
    outputs += pipeline(${nameOfToClassifyDataSet}[i: classify_range_end], truncation=True, max_length=512)`
}

export function genTranslateOutputLabels(): string {
    return `
#------------------------------------------------------------PART 3------------------------------------------------------------
# give outputs more meaningfull names
outputs = [{"score":output["score"], "label":transDic[output["label"]]} for output in outputs]`
}

export function genCalculateAccuracy(doTraining: boolean): string {
    if (doTraining) return genCalculateAcuracyForTraining()
    else return genCalculateAcuracyForClassification()
}

export function genCalculateAcuracyForClassification(): string {
    return `
from sklearn.metrics import accuracy_score
from sklearn.metrics import f1_score

predictions = []
labels = []

for i in range(len(outputs)):
    original_index_of_element = valid_inputs_list_indexes[i]
    if original_index_of_element in valid_gold_label_dict:
        prediction = gold_label_translation[outputs[i]["label"]]
        predictions.append(prediction)
        label = valid_gold_label_dict[original_index_of_element]
        labels.append(label)

# calculate accuracy of the used adapter
if valid_gold_label_dict:
    accuracy = accuracy_score(labels, predictions)
    f1 = f1_score(labels, predictions, average='macro')
else:
    accuracy = "No gold labels found to calculate accuray with"
    f1 = "No gold labels found to calculate f1 with"`
}

export function genCalculateAcuracyForTraining(): string {
    return `
from sklearn.metrics import accuracy_score
from sklearn.metrics import f1_score

valid_gold_label_dict_list = list(valid_gold_label_dict.values())

predictions = []
labels = []

for i in range(len(outputs)):
    prediction = gold_label_translation[outputs[i]["label"]]
    predictions.append(prediction)
    label = valid_gold_label_dict_list[i]
    labels.append(label)

# calculate accuracy of the trained adapter
accuracy = accuracy_score(labels, predictions)
f1 = f1_score(labels, predictions, average='macro')
`
}

export function genHackyInputTruncate(doTraining: boolean, inputType: utils.InputType): string {
    const twoInput = inputType == utils.InputType.TwoInputClassification
    const textsToClassify = doTraining ? `labeled_texts` : `valid_input_data`
    const applyFunction = twoInput
        ? `[hackyTruncate(valid_input[0]), hackyTruncate(valid_input[1])]`
        : `hackyTruncate(valid_input)`
    return `
# this is a compromise until HuggingFace enables truncation for pipeline
def hackyTruncate(text):
    return ' '.join(text.split()[:${twoInput ? `1` : `2`}00])
    
${textsToClassify} = [${applyFunction} for valid_input in ${textsToClassify}]`
}
