//+++++++++++++++++++++++++++++++++++Data preparation  for training++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//TODO check that when mapping these lists in first step to each other the order is preserved

export function genPrepareInputForTraining(twoInput: boolean): string {
    const oneInputElements = `user_input_data_1[index]`
    const twoInputElements = `[user_input_data_1[index],user_input_data_2[index]]`

    const oneInputForTokenizer = `labeled_texts`
    const twoInputForTokenizer = `[elem[0] for elem in labeled_texts],[elem[1] for elem in labeled_texts]`

    return `
#only train with texts where a label exists
#note that we need - 2 since index 0 in list means that the texts was in sheet row 2
labeled_texts = [ ${twoInput ? twoInputElements : oneInputElements} for index in valid_gold_label_dict.keys()]
training_labels = [label for index, label in valid_gold_label_dict.items()]

#encode trainings data
train_encodings = tokenizer(${twoInput ? twoInputForTokenizer : oneInputForTokenizer}, truncation=True, padding=True)
train_dataset = UserDataset(train_encodings, training_labels)`
}

//+++++++++++++++++++++++++++++++++++++++++++needed packages for training++++++++++++++++++++++++++++++++++++
export function genTrainingImportPackages(pipeline: string, modelTransformersClass: string): string {
    return `
#import training specific classes
import dataclasses
import logging
import sys
from dataclasses import dataclass, field
from typing import Dict, Optional
import numpy as np
from torch.utils.data import Dataset
from transformers import  Trainer, TrainingArguments, AdapterType, set_seed
`
}

//+++++++++++++++++++++++++++++++++++++++initialize components for training+++++++++++++++++++++++++++++
export function genUserDatasetClass(): string {
    return `
#create a helper class for encoding trainings data
class UserDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {'input_ids': torch.tensor(self.encodings["input_ids"][idx]),
                'attention_mask': torch.tensor(self.encodings["attention_mask"][idx]),
                'labels': torch.tensor(self.labels[idx])}
        return item

    def __len__(self):
        return len(self.labels)`
}
export function genSetTrainingArgs(learningRate: number, numTrainEpochs: number): string {
    return `
#set training parameter
training_args = TrainingArguments(
    logging_steps=1000,
    per_device_train_batch_size=32,
    per_device_eval_batch_size=64,
    save_steps=1000,
    evaluate_during_training=True,
    output_dir="./training_out.csv",
    overwrite_output_dir=True,
    do_train=True,
    do_eval=True,
    do_predict=True,
    learning_rate=${learningRate},
    num_train_epochs=${numTrainEpochs},
)
set_seed(training_args.seed)`
}

export function genPrepareTrainer(): string {
    return `
#set parameters of the trainer class
trainer = Trainer(
    model=model,  # the instantiated HuggingFace Transformers model to be trained
    args=training_args,  # training arguments, defined above
    train_dataset=train_dataset,  # training dataset
    eval_dataset=train_dataset ) # evaluation dataset`
}

//+++++++++++++++++++++++++++++++++++++++++train adapter+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function genTrain(): string {
    return `
#do training
trainer.train()`
}

//+++++++++++++++++++++++++++++++++++++save adapter after training++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function genSaveAdapter(): string {
    return `
#store the trained adapter
model.save_all_adapters('')`
}
