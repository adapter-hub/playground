//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++Data loading+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function genInitializeSheetConnection(sheetsDocumentURL: string, sheetAccessToken: string): string {
    return `
#initialize connection to google sheet
json_sheet_creds_as_string = '${sheetAccessToken}'
json_object_from_json_string = json.loads(json_sheet_creds_as_string)
creds = ServiceAccountCredentials.from_json_keyfile_dict(json_object_from_json_string)
client = gspread.authorize(creds)
sheet = client.open_by_url('${sheetsDocumentURL}').sheet1`
    //ATTENTION!!! sheet1 might have to be parameterized depending on what input possibilities the user has
}

function genReadSingleInput(): string {
    return `
#get the first colum in the sheets from the second cell forward
user_input_data_1 = sheet.col_values(1)[1:]
#a list of same length as above is created with empty entrances, so backwriting
#in csv gets easier
user_input_data_2 = list(map(lambda x: "", user_input_data_1 ))`
}

function genReadDoubleInput(): string {
    return `
#get the first and the second colum in the sheets from the second cell forward
user_input_data_1 = sheet.col_values(1)[1:]
user_input_data_2 = sheet.col_values(2)[1:]`
}

export function genReadInputFromSheet(inputType: string): string {
    if (inputType == "OneInputClassification") {
        return genReadSingleInput()
    } else {
        return genReadDoubleInput()
    }
}

export function genReadTimestampsFromSheet(): string {
    return `
#read timestamps and padd the list on same length as text inputs so writing in csv gets easier
timestamps = sheet.col_values(4)[1:]
while len(timestamps) < len (user_input_data_1):
    timestamps.append("")`
}

// gold_label_translation muss  nicht hart gecodet sein sondern ..................
export function genReadGoldLabels(goldLabelTranslation: string): string {
    return `
#we padd the list of gold labels to same length of the user input for later convenience
user_input_gold_labels = sheet.col_values(3)[1:]

#read gold labels for training and calculating the accuracy which is also done when no training is done
gold_label_translation = ${goldLabelTranslation}`
}

//+++++++++++++++++++++++++++++++++++++save results +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function genWriteOutputInSheet(sheetsColumnName: string): string {
    return `
sheet.batch_update([{
    'range': '${sheetsColumnName}:${sheetsColumnName}',
    'values': branch_outputs,
}])`
}

export function genStoreResultsWithContextInCsv(): string {
    return `
#store input and results for frontend visualization
filename = "results_for_frontend.csv"
with open(filename, 'w') as csvfile:
    # creating a csv writer object
    csvwriter = csv.writer(csvfile)

    for i in range(len(user_input_data_1)):
        csvwriter.writerow([user_input_data_1[i], user_input_data_2[i], timestamps[i], outputs[i]["score"], outputs[i]["label"]])`
}

export function genStoreMetadata(sheetsLink: string): string {
    return `
#write sheets link and accuracy in file for frontend
file = open("metadata.txt","w")
file.write("${sheetsLink}\\n")
file.write(str(accuracy))
` //store here sheets link and accuracy
}

export function genStoreWarnings(doTraining: boolean): string {
    if (doTraining) return genStoreWarningsForTraining()
    else return genStoreWarningsForClassification()
}

export function genStoreWarningsForClassification(): string {
    return `
if invalid_inputs or indexes_invalid_gold_labels:
    file = open("warnings.txt", "w")
    if invalid_inputs:
        file.write("Empty inputs which where ignored while classifying at following rows: " + str(invalid_inputs) + "\\n")
    if indexes_invalid_gold_labels:
        file.write("Wrong labels which have been ignored: for calculating accuracy" + str(indexes_invalid_gold_labels))`
}

export function genStoreWarningsForTraining(): string {
    return `
if rows_of_correct_labels_with_invalid_inputs:
    file = open("warnings.txt", "w")
    file.write("Invalid data for correct labels which were not used for training at" + str(rows_of_correct_labels_with_invalid_inputs) + "\\n")`
}
