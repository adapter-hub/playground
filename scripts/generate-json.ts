import { AdapterHubAdapter, AdapterHubHierarchy, AdapterHubHierarchyDataset } from "./adapter-hub-models"

export class GenerateJson {
    public generateTaskHeadJson(task: any): string {
        return (
            '{ "task": "' +
            task.task +
            '", "name": "' +
            task.displayname +
            '", "defaultDatasetName": "' +
            "" +
            '", "datasets": ['
        )
    }

    public generateDatasetHeadJson(dataset: any): string {
        return (
            '{ "dataset": "' +
            dataset.subtask +
            '", "name": "' +
            dataset.displayname +
            '", "defaultAdapterIdentifer": "' +
            "" +
            '", "adapters": ['
        )
    }

    public generateAdapterJson(adapter: AdapterHubAdapter): string {
        let adapterArchitecture = "undefined"
        if (adapter.config !== undefined && adapter.config.using !== undefined) {
            adapterArchitecture = adapter.config.using
        }

        let modelTransformerClass = "AutoModel"
        if (adapter.model_class !== undefined) {
            modelTransformerClass = adapter.model_class
        }

        return (
            '{ "type": "' +
            adapter.model_type +
            '", "modelName": "' +
            adapter.model_name +
            '", "modelTransformerClass": "' +
            modelTransformerClass +
            '", "groupname": "' +
            adapter.groupname +
            '", "nlpTaskType": "' +
            adapter.type +
            '", "architecture": "' +
            adapterArchitecture +
            '" }'
        )
    }

    public generateTaskAdapterHierarchyJson(tasks: AdapterHubHierarchy[]) {
        let sourceCode = "[\n"

        for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            sourceCode += "\t" + this.generateTaskHeadJson(tasks[taskIndex].task) + "\n"
            sourceCode += this.generateDatasetsInTaskJson(tasks[taskIndex].datasets)
            sourceCode += "\t]}"

            if (taskIndex < tasks.length - 1) {
                sourceCode += ","
            }

            sourceCode += "\n"
        }

        return sourceCode + "]"
    }

    public generateAdaptersInDatasetJson(adapters: AdapterHubAdapter[]) {
        let sourceCode = ""

        for (let adapterIndex = 0; adapterIndex < adapters.length; adapterIndex++) {
            sourceCode += "\t\t\t" + this.generateAdapterJson(adapters[adapterIndex])

            if (adapterIndex < adapters.length - 1) {
                sourceCode += ","
            }

            sourceCode += "\n"
        }

        return sourceCode
    }

    public generateDatasetsInTaskJson(datasets: AdapterHubHierarchyDataset[]) {
        let sourceCode = ""

        for (let datasetIndex = 0; datasetIndex < datasets.length; datasetIndex++) {
            sourceCode += "\t\t" + this.generateDatasetHeadJson(datasets[datasetIndex].dataset) + "\n"
            sourceCode += this.generateAdaptersInDatasetJson(datasets[datasetIndex].adapters)
            sourceCode += "\t\t]}"

            if (datasetIndex < datasets.length - 1) {
                sourceCode += ","
            }

            sourceCode += "\n"
        }

        return sourceCode
    }
}
