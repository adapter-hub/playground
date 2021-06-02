export function genImportTrainingPackages(): string {
    return `
# import training specific classes
import dataclasses
import logging
import sys
from dataclasses import dataclass, field
from typing import Dict, Optional
import numpy as np
from torch.utils.data import Dataset
from transformers import  Trainer, TrainingArguments, AdapterType, set_seed`
}

export function genUserDatasetClass(): string {
    return `
# create a helper class for encoding trainings data
class UserDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {'labels': torch.tensor(self.labels[idx])}
        for key in self.encodings.keys():
            item[key] = torch.tensor(self.encodings[key][idx])
        return item

    def __len__(self):
        return len(self.labels)`
}

export function genSetTrainingArgs(learningRate: number, numTrainEpochs: number): string {
    return `
# set training parameters
training_args = TrainingArguments(
    logging_steps=1000,
    per_device_train_batch_size=32,
    save_steps=1000,
    output_dir="./training_output",
    report_to="none",
    do_train=True,
    learning_rate=${learningRate},
    num_train_epochs=${numTrainEpochs},
)
set_seed(training_args.seed)`
}

export function genIterativeTraining(twoInput: boolean): string {
    const oneInputForTokenizer = `labeled_texts_for_this_iteration`
    const twoInputForTokenizer = `[elem[0] for elem in labeled_texts_for_this_iteration],[elem[1] for elem in labeled_texts_for_this_iteration]`
    const sizePerIteration = 10 //this is only an estimation based on manuel tests on Kaggle which is chosen rather too low, still could be sometimes too high
    return `
# training is done in iterations in order to not exceed Memory Limit on Kaggle
length_of_training_data = len(labeled_texts)
# could be tried to set higher if you´re input data is small (however program might not run on Kaggle then)
size_per_iteration = ${sizePerIteration}

for i in range(0, length_of_training_data, size_per_iteration):
    training_range_end = min([i+size_per_iteration, length_of_training_data])

    # encode trainings data
    labeled_texts_for_this_iteration = labeled_texts[i:training_range_end]
    train_encodings = tokenizer(${
        twoInput ? twoInputForTokenizer : oneInputForTokenizer
    }, truncation=True, padding=True)
    train_dataset = UserDataset(train_encodings, training_labels[i:training_range_end])
    
    # set parameters of the trainer class
    trainer = Trainer(
        model=model,  # the instantiated HuggingFace Transformers model to be trained
        args=training_args,  # training arguments, defined above
        train_dataset=train_dataset,  # training dataset
        eval_dataset=train_dataset ) # evaluation dataset
    
    trainer.train()`
}

export function genPrepareInputForIterativeTraining(twoInput: boolean): string {
    const oneInputElements = `user_input_data_1[index]`
    const twoInputElements = `[user_input_data_1[index],user_input_data_2[index]]`

    return `
# only train with texts where a label exists
labeled_texts = [ ${twoInput ? twoInputElements : oneInputElements} for index in valid_gold_label_dict.keys()]
training_labels = [label for index, label in valid_gold_label_dict.items()]`
}
