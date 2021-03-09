import * as training from "./training"

//++++++++++++++++++++++++++++++++++ kaggle's instructions +++++++++++++++++++++++++++++++++++++++++++++++++++
export function genKaggleFirstStepOs(): string {
    return `
import os
os.system('pip uninstall -y transformers')
os.system('pip uninstall -y typing')
os.system('pip uninstall -y tokenizers')
os.system('pip uninstall -y sacremoses')
os.system('pip install gspread oauth2client')`
}

export function genKaggleSecondStepOs(): string {
    return `
os.system('pip install git+https://github.com/adapter-hub/adapter-transformers.git')
`
}

//+++++++++++++++++++++++++++++++++++needed packages++++++++++++++++++++++++++++++++++++++++++++++++++++
export function genImportSheetConnectionPackages(): string {
    return `
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
`
}

export function genImportRemainingPackages(
    doTraining: boolean,
    pipeline: string,
    modelTransformersClass: string
): string {
    const sharedRemainingPackages = `
import torch
from transformers import AutoTokenizer,AdapterConfig,${modelTransformersClass}
import csv
from transformers import ${pipeline}`

    if (doTraining) {
        return `
${sharedRemainingPackages}
${training.genTrainingImportPackages(pipeline, modelTransformersClass)}
`
    } else {
        return `
${sharedRemainingPackages}`
    }
}
//+++++++++++++++++++++++++++++++++++initialize needed shared components ++++++++++++++++++++++++++++++++++++++
export function genTokenizer(modelName: string): string {
    return `
# load pre-trained tokenizer from Huggingface
tokenizer = AutoTokenizer.from_pretrained('${modelName}')`
}

export function genLoadPreTrainedModel(modelName: string, modelTransformersClass: string): string {
    return `
# load pre-trained model from Huggingface
model = ${modelTransformersClass}.from_pretrained('${modelName}')`
}

export function genAdapterArchitecture(adapterArchitecture: string): string {
    return `
#get an adapter architecture from AdapterHub
config = AdapterConfig.load("${adapterArchitecture}")`
}

export function genLoadAdapter(
    taskType: string,
    trainingDataset: string,
    adapterGroupName: string,
    nlpTaskType: string
): string {
    const adapterId = `${taskType}/${trainingDataset}@${adapterGroupName}`
    return `
# load pre-trained text_task adapter from Adapter Hub
# this method call will also load a pre-trained classification head for the adapter task
adapter_name = model.load_adapter("${adapterId}","${nlpTaskType}",config=config)`
}

export function genNeededPipeline(pipeline: string): string {
    return `
pipeline = ${pipeline}(model=model,tokenizer=tokenizer)`
}

export function genCreateLabelTranslationDic(transDic: string): string {
    return `
transDic = {${transDic}}`
}

export function genPrepareAdapterOnModel(doTraining: boolean): string {
    let freezeModelWeights = ``
    if (doTraining) {
        freezeModelWeights = `
#prepare adapter and model for the training by freezing weights of model
model.train_adapter(adapter_name)`
    }
    return `${freezeModelWeights}
#enable the adapter for classification of model
model.set_active_adapters([adapter_name])`
}

export function genPredictOutput(doTraining: boolean): string {
    return `
#classify input texts
outputs = pipeline(${doTraining ? "labeled_texts" : "valid_input_data"})`
}

export function genTranslateOutputLabels(): string {
    return `
#give labels more meaningfull names
outputs = [{"score":elem["score"], "label":transDic[elem["label"]]} for elem in outputs]`
}

export function genPrepareOutputsToBeWrittenInTheSheet(newNameOfResultColumn: string): string {
    return `
#update name of result column
branch_outputs = [["${newNameOfResultColumn}"]]
for index in range(len(outputs)):
    branch_outputs.append([outputs[index]["label"]+","+str(outputs[index]["score"])])
`
}

export function genCalculateAccuracy(doTraining: boolean): string {
    if (doTraining) return genCalculateAcuracyForTraining()
    else return genCalculateAcuracyForClassification()
}

export function genCalculateAcuracyForClassification(): string {
    return `
#count for all valid inputs where valid gold labels existed how many of those given labels are equal to infered label
results_equal_to_labels = 0
for i in range(len(outputs)):
    original_index_of_element = valid_input_original_indexes[i]
    if original_index_of_element in valid_gold_label_dict:
        if gold_label_translation[outputs[i]["label"]] == valid_gold_label_dict[original_index_of_element]:
            results_equal_to_labels += 1

if valid_gold_label_dict:
    accuracy = results_equal_to_labels / len(valid_gold_label_dict)
else:
    accuracy = "No gold labels found to calculate accuray with"`
}

export function genCalculateAcuracyForTraining(): string {
    return `
#count how many of the classified labels are same as their gold label
results_equal_to_labels = 0
valid_gold_label_dict_list = list(valid_gold_label_dict.values())
for i in range(len(outputs)):
    if gold_label_translation[outputs[i]["label"]] == valid_gold_label_dict_list[i]:
        results_equal_to_labels = results_equal_to_labels + 1

if valid_gold_label_dict:
    accuracy = results_equal_to_labels / len(valid_gold_label_dict)

else:
    accuracy = "No gold labels found to calculate accuray with"`
}
