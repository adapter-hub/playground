//STRUCTURE OF FILE
//gen functions are structured after their appearance in code
//they appear as pair, first for class, then for train in case two version are needed

export function genFilterInvalidTextInputs(doTraining: boolean, twoInput: boolean): string {
    if (doTraining) return genFilterInvalidTextInputsForTraining(twoInput)
    else return genFilterInvalidTextInputsForClassification(twoInput)
}

export function genFilterInvalidTextInputsForClassification(twoInput: boolean): string {
    const add_rows_of_overlapping_input2_to_invalid_inputs = `
#at this point, there might be (after last element of input 1) input 2 lines where an invalid(empty) input 1 exists
#therefore we add all of these to our invalid collection
#ATTENTION COULD BE OFF BY ONE
invalid_inputs += list(map(lambda x:x+2, range(len(user_input_data_1), len(user_input_data_2))))`

    const comment_for_2input = `
#not that valid input already has desired form for pipeline, list of [input1, input2]`

    const additional_conditions_2input_valid = `or len(user_input_data_2) <= i or user_input_data_2[i] ==  ""`

    //bad names for both const below
    const valid_1input = `user_input_data_1[elem]`

    const valid_2input = `[user_input_data_1[elem], user_input_data_2[elem]]`

    return `
invalid_inputs = []
valid_input_original_indexes = []
for i in range(len(user_input_data_1)):
    print(i)
    ${twoInput ? `#input invalid if either of the two inputs is invalid` : ``}
    if user_input_data_1[i] == "" ${twoInput ? additional_conditions_2input_valid : ``}:
        invalid_inputs.append(i + 2)
    else:
        valid_input_original_indexes.append(i)
${twoInput ? add_rows_of_overlapping_input2_to_invalid_inputs : ``}
${twoInput ? comment_for_2input : ``}
valid_input_data = [ ${twoInput ? valid_2input : valid_1input} for elem in valid_input_original_indexes]`
}

export function genFilterInvalidTextInputsForTraining(twoInput: boolean): string {
    const additionalConditionFor2Input = `or len(user_input_data_2) <= i or user_input_data_2[i] == ""`

    const addOverlapping2inputAsInvalidRows = `
#at this point, there might be (after last element of input 1) input 2 lines where an invalid(empty) input 1 exists
#therefore we add all of these to our invalid collection
#ATTENTION COULD BE OFF BY ONE
invalid_inputs += list(map(lambda x:x+2, range(len(user_input_data_1), len(user_input_data_2))))`

    return `
#when training we only have to store rows of empty inputs
invalid_inputs = []
for i in range(len(user_input_data_1)):
    if user_input_data_1[i] == "" ${twoInput ? additionalConditionFor2Input : ``}:
        invalid_inputs.append(i + 2)

${twoInput ? addOverlapping2inputAsInvalidRows : ``}`
}

export function genFilterGoldLabels(doTraining: boolean, twoInput: boolean): string {
    if (doTraining) return genFilterGoldLabelsForTraining(twoInput)
    else return genFilterGoldLabelsForClassification(twoInput)
}

export function genFilterGoldLabelsForClassification(twoInput: boolean): string {
    const additional_condition_for_2input = `and len(user_input_data_2) > i and user_input_data_2[i]`

    return `
#we make a dict which stores an entry for each correct label, with its index as key
#we need this when later calculating accuracy and pairing them to their inputs
valid_gold_label_dict = {}
indexes_invalid_gold_labels = []
for i in range(len(user_input_gold_labels)):
    current_label = user_input_gold_labels[i]
    if  current_label in gold_label_translation:
        #check that input was valid at this position, otherwise even correct label can´t be used
        if len(user_input_data_1) > i and user_input_data_1[i] != "" ${twoInput ? additional_condition_for_2input : ``}:
            valid_gold_label_dict[i] = gold_label_translation[current_label]
    elif current_label != "":
        indexes_invalid_gold_labels.append(i + 2)`
}

export function genFilterGoldLabelsForTraining(twoInput: boolean): string {
    const additionalConditionFor2Input = `and len(user_input_data_2) > i and user_input_data_2[i] != ""`

    return `
#ERROR HANDLING: filter gold labels
valid_gold_label_dict = {}
indexes_invalid_gold_labels = []
rows_of_correct_labels_with_invalid_inputs = []
for i in range(len (user_input_gold_labels)):
    current_label = user_input_gold_labels[i]
    if  current_label in gold_label_translation:
        #store correct label if input was correct too
        if len(user_input_data_1) > i and user_input_data_1[i] != "" ${twoInput ? additionalConditionFor2Input : ``}:
            valid_gold_label_dict[i] = gold_label_translation[current_label]
        #else store where this went wrong
        else:
            rows_of_correct_labels_with_invalid_inputs.append(i+2)
    elif current_label != "":
        indexes_invalid_gold_labels.append(i+2)`
}

export function genPossibleTerminate(doTraining: boolean): string {
    if (doTraining) return genTerminateForTraining()
    else return genTerminateForClassification()
}

export function genTerminateForClassification(): string {
    return `
if not valid_input_data:
    file = open("Error.txt", "w")
    file.write("No valid input found.")
    exit()`
}

export function genTerminateForTraining(): string {
    return `
#if no or wrong gold label found we abort the program
if not valid_gold_label_dict or indexes_invalid_gold_labels:
    error_message = ""
    if indexes_invalid_gold_labels:
        error_message = "Couldn´t identify labels at: " + str(indexes_invalid_gold_labels) + "\\n"
    if not valid_gold_label_dict:
        error_message+= "No non empty data with valid label to train with."
    file = open("Error.txt","w") 
    file.write(error_message)
    exit()`
}

export function padResultsForEmptyInputs(twoInput: boolean, newNameOfResultColumn: string): string {
    const paddForOverlapping2Input = `
#we have to pas with empties in case input2 was longer
while (len(branch_outputs)-1) < len(user_input_data_2):
    branch_outputs.append([""])`

    return `
#update name of result column
branch_outputs = [["${newNameOfResultColumn}"]]
for i in range(len(valid_input_original_indexes)):
    #here we make sure empty cells are written for inputs which where invalid
    print(valid_input_original_indexes[i])
    print(len(branch_outputs))
    for j in range(valid_input_original_indexes[i] - (len(branch_outputs) - 1)):
        branch_outputs.append([""])
        print("yes")
    branch_outputs.append([outputs[i]["label"] + "," + str(outputs[i]["score"])])

${twoInput ? paddForOverlapping2Input : ``}`
}
