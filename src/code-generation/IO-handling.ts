import * as utils from "./utils"

export function genInitializeSheetConnection(sheetsDocumentURL: string, sheetAccessToken: string): string {
    return `
# initialize connection to google sheet
json_sheet_creds_as_string = '${sheetAccessToken}'
json_object_from_json_string = json.loads(json_sheet_creds_as_string)
creds = ServiceAccountCredentials.from_json_keyfile_dict(json_object_from_json_string)
client = gspread.authorize(creds)
sheet = client.open_by_url('${sheetsDocumentURL}').sheet1`
}

export function genExtractAdapterFromUploadedZip(zipFileName: string): string {
    return `
import zipfile

with zipfile.ZipFile("${zipFileName}","r") as adapter_zip_file:
   adapter_zip_file.extractall("input_adapter_folder")
`
}

function genReadSingleInput(): string {
    return `
# get the input data from the first column in the google sheets from the second row onwards
user_input_data_1 = sheet.col_values(1)[1:]`
}

function genReadDoubleInput(): string {
    return `
# get the input data from the first two columns in the google sheets from the second row onwards
user_input_data_1 = sheet.col_values(1)[1:]
user_input_data_2 = sheet.col_values(2)[1:]`
}

export function genReadInputFromSheet(inputType: utils.InputType): string {
    if (inputType == utils.InputType.OneInputClassification) {
        return genReadSingleInput()
    } else {
        return genReadDoubleInput()
    }
}

export function genReadTimestampsFromSheet(): string {
    return `
# read timestamps and padd the list on same length as text inputs so writing in csv gets easier
timestamps = sheet.col_values(4)[1:]
while len(timestamps) < len (user_input_data_1):
    timestamps.append("")`
}

export function genReadGoldLabels(goldLabelTranslation: string): string {
    return `
# get the gold labels from the third column in the google sheets from the second row onwards
user_input_gold_labels = sheet.col_values(3)[1:]

# mapping for all accepted labels into uniform representation
gold_label_translation = ${goldLabelTranslation}`
}

export function genWriteOutputInSheet(sheetsColumnName: string): string {
    return `
# write results in google sheet
sheet.batch_update([{
    'range': '${sheetsColumnName}:${sheetsColumnName}',
    'values': list_to_write_in_sheets_result_column,
}])`
}

export function genStoreMetadata(sheetsLink: string): string {
    return `
# write sheets link and accuracy in file for frontend
file = open("metadata.txt","w")
file.write("${sheetsLink}\\n")
file.write(str(accuracy) + "\\n")
file.write(str(f1))`
}

export function genStoreWarnings(doTraining: boolean): string {
    if (doTraining) return genStoreWarningsForTraining()
    else return genStoreWarningsForClassification()
}

export function genStoreWarningsForClassification(): string {
    return `
# create a warnings file if needed
if invalid_inputs_row_index or invalid_gold_labels_row_index:
    file = open("warnings.txt", "w")
    if invalid_inputs_row_index:
        file.write("Empty inputs which where ignored while classifying at following rows: " + str(invalid_inputs_row_index) + "\\n")
    if invalid_gold_labels_row_index:
        file.write("Wrong labels which have been ignored: for calculating accuracy" + str(invalid_gold_labels_row_index))`
}

export function genStoreWarningsForTraining(): string {
    return `
# create a warnings file if needed
if rows_of_correct_labels_with_invalid_inputs:
    file = open("warnings.txt", "w")
    file.write("Invalid data for correct labels which were not used for training at" + str(rows_of_correct_labels_with_invalid_inputs) + "\\n")`
}

export function genZipTrainedAdapter(): string {
    return `
# adapter file is ziped for frontend to download
import shutil
shutil.make_archive(dir_name_of_trained_adapter,"zip", dir_name_of_trained_adapter)`
}

export function genLoadAdapterFromUser(): string {
    return `
# load own adapter
adapter_name = model.load_adapter("/kaggle/working/input_adapter_folder")`
}

export function genSaveAdapter(): string {
    return `
#------------------------------------------------------------PART 3------------------------------------------------------------
# store the trained adapter
dir_name_of_trained_adapter = "trained_adapter"
model.save_adapter(save_directory= ("./"+dir_name_of_trained_adapter) , adapter_name=adapter_name)`
}

export function genDeleteUselessFiles(): string {
    return `
# files which are not needed to be presented to the user are deleted
import shutil
shutil.rmtree('/kaggle/working/runs', ignore_errors=True)
shutil.rmtree('/kaggle/working/input_adapter_folder', ignore_errors=True)
shutil.rmtree('/kaggle/working/trained_adapter', ignore_errors=True)`
}
