import * as utils from "./utils"

export function genFilterInvalidTextInputs(doTraining: boolean, inputType: utils.InputType): string {
    if (doTraining) return genFilterInvalidTextInputsForTraining(inputType)
    else return genFilterInvalidTextInputsForClassification(inputType)
}

export function genFilterInvalidTextInputsForClassification(inputType: utils.InputType): string {
    const twoInput = inputType == utils.InputType.TwoInputClassification
    const addRowsOfOverlappingInput2sToInvalidInputs = `
# at this point, there might be (after last element of input 1) input 2 lines where an invalid(empty) input 1 exists
# therefore we add all of these to our invalid collection
invalid_inputs_row_index += list(map(lambda x:x+2, range(len(user_input_data_1), len(user_input_data_2))))`

    const commentFor2Input = `
# note that valid input already has desired form for pipeline, list of [input1, input2]`

    const additional_conditions_2input_valid = `or len(user_input_data_2) <= i or user_input_data_2[i] ==  ""`
    const filterValidInputsOut = twoInput
        ? `[user_input_data_1[index], user_input_data_2[index]]`
        : `user_input_data_1[index]`

    return `
# here we sort out all inputs which are invalid (meaning that ${
        twoInput ? `one of the two inputs is empty` : `it´s empty`
    })
# we do this in order to know what to classify and which rows to skip when writing back the results
invalid_inputs_row_index = []
valid_inputs_list_indexes = []
for i in range(len(user_input_data_1)):
    # store all rows of invalid inputs and indexes of valid inputs
    if user_input_data_1[i] == "" ${twoInput ? additional_conditions_2input_valid : ``}:
        invalid_inputs_row_index.append(i + 2)
    else:
        valid_inputs_list_indexes.append(i)
${twoInput ? addRowsOfOverlappingInput2sToInvalidInputs : ``}
${twoInput ? commentFor2Input : ``}
valid_input_data = [ ${filterValidInputsOut} for index in valid_inputs_list_indexes]`
}

export function genFilterInvalidTextInputsForTraining(inputType: utils.InputType): string {
    const twoInput = inputType == utils.InputType.TwoInputClassification
    const additionalConditionFor2Input = `or len(user_input_data_2) <= i or user_input_data_2[i] == ""`

    const addOverlapping2inputAsInvalidRows = `
# at this point, there might be input 2 texts (with higher row indexes than all input 1) where an invalid (empty) input 1 exists
# therefore we add all of these to our invalid row indexes list
invalid_inputs_row_index += list(map(lambda x:x+2, range(len(user_input_data_1), len(user_input_data_2))))`

    return `
# store all invalid (empty) inputs since they shall not be used for training
invalid_inputs_row_index = []
for i in range(len(user_input_data_1)):
    if user_input_data_1[i] == "" ${twoInput ? additionalConditionFor2Input : ``}:
        invalid_inputs_row_index.append(i + 2)

${twoInput ? addOverlapping2inputAsInvalidRows : ``}`
}

export function genFilterGoldLabels(doTraining: boolean, inputType: utils.InputType): string {
    if (doTraining) return genFilterGoldLabelsForTraining(inputType)
    else return genFilterGoldLabelsForClassification(inputType)
}

export function genFilterGoldLabelsForClassification(inputType: utils.InputType): string {
    const twoInput = inputType == utils.InputType.TwoInputClassification
    const additional_condition_for_2input = `and len(user_input_data_2) > i and user_input_data_2[i]`

    return `
# we make a dict which stores an entry for each correct label, with its list index as key
# we need this when later calculating accuracy and pairing the existing correct labels to their inputs
valid_gold_label_dict = {}
invalid_gold_labels_row_index = []
for i in range(len(user_input_gold_labels)):
    current_label = user_input_gold_labels[i]
    if  current_label in gold_label_translation:
        # check that input was valid at this position, otherwise even correct label is of no use
        if len(user_input_data_1) > i and user_input_data_1[i] != "" ${twoInput ? additional_condition_for_2input : ``}:
            valid_gold_label_dict[i] = gold_label_translation[current_label]
    elif current_label != "":
        invalid_gold_labels_row_index.append(i + 2)`
}

export function genFilterGoldLabelsForTraining(inputType: utils.InputType): string {
    const twoInput = inputType == utils.InputType.TwoInputClassification
    const additionalConditionFor2Input = `and len(user_input_data_2) > i and user_input_data_2[i] != ""`

    return `
# process given gold labels, for error/warning management and usage in training
valid_gold_label_dict = {}
invalid_gold_labels_row_index = []
rows_of_correct_labels_with_invalid_inputs = []
for i in range(len (user_input_gold_labels)):
    current_label = user_input_gold_labels[i]
    if  current_label in gold_label_translation:
        # store correct label if input was correct too
        if len(user_input_data_1) > i and user_input_data_1[i] != "" ${twoInput ? additionalConditionFor2Input : ``}:
            valid_gold_label_dict[i] = gold_label_translation[current_label]
        # else store where this went wrong
        else:
            rows_of_correct_labels_with_invalid_inputs.append(i+2)
    elif current_label != "":
        invalid_gold_labels_row_index.append(i+2)`
}

export function genPossibleTerminate(doTraining: boolean): string {
    if (doTraining) return genTerminateForTraining()
    else return genTerminateForClassification()
}

export function genTerminateForClassification(): string {
    return `
# program is aborted if nothing valid to classify exists
if not valid_input_data:
    file = open("error.txt", "w")
    file.write("No valid input found.")
    exit()`
}

export function genTerminateForTraining(): string {
    return `
# if no or wrong gold label found we abort the program
if not valid_gold_label_dict or invalid_gold_labels_row_index:
    error_message = ""
    if invalid_gold_labels_row_index:
        error_message = "Couldn´t identify labels at: " + str(invalid_gold_labels_row_index) + "\\n"
    if not valid_gold_label_dict:
        error_message+= "No non empty data with valid label to train with."
    file = open("error.txt","w") 
    file.write(error_message)
    exit()`
}

export function genPrepareResultsForSheet(inputType: utils.InputType, newNameOfResultColumn: string): string {
    const twoInput = inputType == utils.InputType.TwoInputClassification
    const paddForOverlapping2Input = `
# we have to padd with empty outputs in case one of the input columns was longer
existingRows = max([len(user_input_data_1), len(user_input_data_2)])
while (len(list_to_write_in_sheets_result_column)-1) < existingRows:
    list_to_write_in_sheets_result_column.append([""])`

    return `
# create the list which will be written into the result column, here we have to remember our invalid inputs
list_to_write_in_sheets_result_column = [["${newNameOfResultColumn}"]]
for i in range(len(valid_inputs_list_indexes)):
    # here we make sure empty cells are written for inputs which where invalid

    for j in range(valid_inputs_list_indexes[i] - (len(list_to_write_in_sheets_result_column) - 1)):
        list_to_write_in_sheets_result_column.append([""])
    list_to_write_in_sheets_result_column.append([outputs[i]["label"] + "," + str(outputs[i]["score"])])

${twoInput ? paddForOverlapping2Input : ``}`
}
