// The input type of the task
export enum InputType {
    OneInputClassification,
    TwoInputClassification,
}
// the pipeline we use
export enum Pipeline {
    TextClassificationPipeline = "TextClassificationPipeline",
    QuestionAnsweringPipeline = "QuestionAnsweringPipeline",
}

// check if a list of strings contains the string obj
function contains(list: string[], obj: string): boolean {
    for (let i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true
        }
    }
    return false
}
//the list of tasks using the textClassificationPipeline
const textClassificationPipelineList: string[] = [
    "sentiment/hinglish-twitter-sentiment",
    "sentiment/hinglish",
    "sentiment/imdb",
    "sentiment/rotten_tomatoes",
    "sentiment/sst-2",
    "argument/ukpsent",
    "dialect/arabic",
    "dialect/dialect-arabic",
    "lingaccept/cola",
    "ner/conll2003",
    "sts/mrpc",
    "sts/qqp",
    "sts/stackexchange",
    "sts/sts-b",
    "qa/boolq",
    "nli/multinli",
    "nli/mnli",
    "nli/cb",
    "nli/super_glue_cb",
    "nli/qnli",
    "nli/rte",
]

//the function to find out the pipeline to use
//and for that we need taskType and trainingDataset
export function findNeededPipeline(taskType: string, trainingDataset: string): string {
    const theTask = `${taskType}/${trainingDataset}`
    if (contains(textClassificationPipelineList, theTask)) {
        return Pipeline.TextClassificationPipeline
    } else {
        // nicht alle Aufgaben sin bedeckt
        return Pipeline.QuestionAnsweringPipeline
    }
}

//the list of tasks using the OneInputClassification
const oneInputClassificationList: string[] = [
    "sentiment/hinglish-twitter-sentiment",
    "sentiment/hinglish",
    "sentiment/imdb",
    "sentiment/rotten_tomatoes",
    "sentiment/sst-2",
    "argument/ukpsent",
    "dialect/arabic",
    "dialect/dialect-arabic",
    "lingaccept/cola",
    "ner/conll2003"
]
//the function to find out the input type of the task  to use
//and for that we need taskType and trainingDataset
export function getInputType(taskType: string, trainingDataset: string): InputType {
    const theTask = `${taskType}/${trainingDataset}`
    if (contains(oneInputClassificationList, theTask)) {
        return InputType.OneInputClassification
    } else {
        return InputType.TwoInputClassification
    }
}
//a list of lists and for each list there is transDic and a GoldLabelTranslation
const transDicAndGoldLabelTranslationList: string[][] = [
    ["sentiment/imdb", "sentiment/rotten_tomatoes", "sentiment/sst-2", "nli/qnli", "nli/rte", "lingaccept/cola"],
    ["sts/mrpc", "sts/qqp", "sts/stackexchange"],
    ["sentiment/hinglish-twitter-sentiment", "sentiment/hinglish"],
    ["argument/ukpsent"],
    ["nli/cb", "nli/super_glue_cb", "nli/multinli", "nli/mnli"],
    ["sts/sts-b"],
    ["dialect/arabic", "dialect/dialect-arabic"],
]

//a list of lists for the different transDic and GoldLabelTranslation
const transDicAndGoldLabelTranslationResultList: string[][] = [
    [
        `"LABEL_1":"positive", "LABEL_0":"negative"`,
        `{"positive": 1, "negative" : 0, "LABEL_1" : 1, "LABEL_0" : 0, "0" : 0, "1" : 1}`,
    ],
    [
        `"LABEL_1":"equivalent", "LABEL_0":"inequivalent"`,
        `{"equivalent": 1, "inequivalent" : 0, "LABEL_1" : 1, "LABEL_0" : 0, "0" : 0, "1" : 1}`,
    ],
    [
        `"LABEL_2":"positive","LABEL_1":"neutral", "LABEL_0":"negative"`,
        `{"positive": 2,"neutral": 1, "negative" : 0, "LABEL_2" : 2,"LABEL_1" : 1, "LABEL_0" : 0,"0": 0,"1": 1,"2": 2}`,
    ],
    [
        `"LABEL_2":"supporting","LABEL_1":"not an argument", "LABEL_0":"attacking"`,
        `{"supporting": 2,"not an argument": 1, "attacking" : 0, "LABEL_2" : 2,"LABEL_1" : 1, "LABEL_0" : 0,"0": 0,"1": 1,"2": 2}`,
    ],
    [
        `"LABEL_2":"entailment","LABEL_1":"neutral", "LABEL_0":"contradiction"`,
        `{"entailment": 2,"neutral": 1, "contradiction" : 0, "LABEL_2" : 2,"LABEL_1" : 1, "LABEL_0" : 0,"0": 0,"1": 1,"2": 2}`,
    ],
    [
        `"LABEL_5":"5","LABEL_4":"4","LABEL_3":"3","LABEL_2":"2", "LABEL_1":"1", "LABEL_0":"0"`,
        `{0:0, 1:1, 2:2, 3:3, 4:4, 5:5,"5": 5,"4": 4,"3": 3,"2": 2,"1": 1,"0": 0,"LABEL_5" : 5,"LABEL_4" : 4, "LABEL_3" : 3,"LABEL_2" : 2, "LABEL_1" : 1, "LABEL_0" : 0}`,
    ],
    [
        `"LABEL_4":"MSA","LABEL_3":"Maghrebi","LABEL_2":"Levantine","LABEL_1":"Gulf", "LABEL_0":"Egyptian"`,
        `{"MSA": 4,"Maghrebi": 3,"Levantine": 2,"Gulf": 1,"Egyptian": 0,"LABEL_4" : 4,"LABEL_3" : 3, "LABEL_2" : 2,"LABEL_1" : 1, "LABEL_0" : 0,"4": 4,"3": 3,"2": 2,"1": 1,"0": 0}`,
    ],
]

//the function to find out the transDic and the  GoldLabelTranslation
//and for that we need taskType and trainingDataset
export function checkTransDicAndGoldLabelTranslationOfTheTask(taskType: string, trainingDataset: string): string[] {
    const theTask = `${taskType}/${trainingDataset}`
    //
    for (let i = 0; i < transDicAndGoldLabelTranslationList.length; i++) {
        if (contains(transDicAndGoldLabelTranslationList[i], theTask)) {
            return transDicAndGoldLabelTranslationResultList[i]
        }
    }
    return ["task not supported yet", "task not supported yet"]
}
