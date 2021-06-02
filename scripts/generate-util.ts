import { GenerateJson } from "./generate-json"
import {
    AdapterHubAdapter,
    AdapterHubHierarchy,
    AdapterHubTask,
    AdapterHubDataset,
    AdapterHubHierarchyDataset,
} from "./adapter-hub-models"

import { readdirSync, readFileSync, writeFileSync, rmdirSync, mkdirSync, existsSync } from "fs"
import { spawn } from "child_process"
import yaml from "js-yaml"

export class GenerateUtil {
    private readonly repositoryURL: string
    private readonly repositoryTargetDir: string

    private readonly sourceFileDir: string

    private readonly adaptersDir: string
    private readonly tasksDir: string
    private readonly datasetsDir: string

    private taskHierarchy: AdapterHubHierarchy[]

    private adapters: AdapterHubAdapter[]
    private tasks: AdapterHubTask[]
    private datasets: AdapterHubDataset[]

    constructor(repositoryURL: string, repositoryTargetDir: string, sourceFileDir: string) {
        this.repositoryURL = repositoryURL
        this.repositoryTargetDir = repositoryTargetDir

        this.sourceFileDir = sourceFileDir

        this.adaptersDir = this.repositoryTargetDir + "/adapters"
        this.tasksDir = this.repositoryTargetDir + "/tasks"
        this.datasetsDir = this.repositoryTargetDir + "/subtasks"

        this.taskHierarchy = []

        this.adapters = []
        this.tasks = []
        this.datasets = []
    }

    public async cloneGitRepository(): Promise<number> {
        const cloneGitRepositoryProcess = spawn("git", ["clone", this.repositoryURL, this.repositoryTargetDir])
        return new Promise<number>((resolutionFunc, rejectionFunc) => {
            cloneGitRepositoryProcess.on("exit", (code: number) => resolutionFunc(code))
        })
    }

    public deleteLocalRepository() {
        if (existsSync(this.repositoryTargetDir)) {
            rmdirSync(this.repositoryTargetDir, { recursive: true })
        }
    }

    public writeToSourceFile(fileName: string, source: string) {
        if (!existsSync(this.sourceFileDir)) {
            mkdirSync(this.sourceFileDir)
        }
        writeFileSync(this.sourceFileDir + "/" + fileName, source)
    }

    public generateSourceCode(): string {
        const generateJson: GenerateJson = new GenerateJson()

        this.readTasksDatasetsAdaptersFromYAMLFiles()
        this.filterUnusedAdapters()

        this.createTaskAdapterHierarchy()

        return generateJson.generateTaskAdapterHierarchyJson(this.taskHierarchy)
    }

    public readTasksDatasetsAdaptersFromYAMLFiles() {
        this.adapters = this.readFromYAMLFiles(this.adaptersDir)
        this.tasks = this.readFromYAMLFiles(this.tasksDir)
        this.datasets = this.readFromYAMLFiles(this.datasetsDir)
    }

    public readFromYAMLFiles(directory: string): any[] {
        const objects: any[] = []
        const groupDir: string[] = readdirSync(directory)

        for (const subgroup of groupDir) {
            const subgroupDir: string[] = readdirSync(directory + "/" + subgroup)

            for (const object of subgroupDir) {
                const objectFileContent = readFileSync(directory + "/" + subgroup + "/" + object)

                const objectYaml: any = yaml.load(objectFileContent.toString())
                //this can be improved as the groupname should only be on the adater metadata
                objectYaml.groupname = subgroup
                objects.push(objectYaml)
            }
        }
        return objects
    }

    public createTaskAdapterHierarchy() {
        for (const adapter of this.adapters) {
            this.addAdapterToTaskHierarchyTasks(adapter)
        }
    }

    public addAdapterToTaskHierarchyTasks(adapter: AdapterHubAdapter) {
        const existingTask = this.getTaskFromHierarchy(adapter.task)
        if (existingTask !== undefined) {
            // if Task exists
            this.addAdapterToTaskHierarchyDatasets(adapter, existingTask)
        } else {
            // Push Adapter into new Dataset
            const dataset: AdapterHubHierarchyDataset = {
                dataset: <AdapterHubDataset>this.getDatasetByName(adapter.task, adapter.subtask),
                adapters: [adapter],
            }

            // Push new Task to Hierarchy
            this.taskHierarchy.push({
                task: <AdapterHubTask>this.getTaskByName(adapter.task),
                datasets: [dataset],
            })
        }
    }

    public addAdapterToTaskHierarchyDatasets(adapter: AdapterHubAdapter, task: AdapterHubHierarchy) {
        const existingDataset = this.getDatasetFromTask(adapter.task, adapter.subtask, task.datasets)
        if (existingDataset !== undefined) {
            // if Dataset exists
            // Push Adapter into Dataset
            existingDataset.adapters.push(adapter)
        } else {
            // Push new Dataset to Task
            task.datasets.push({
                dataset: <AdapterHubDataset>this.getDatasetByName(adapter.task, adapter.subtask),
                adapters: [adapter],
            })
        }
    }

    private getTaskByName(name: string) {
        for (const task of this.tasks) {
            if (task.task === name) {
                return task
            }
        }

        return undefined
    }

    private getDatasetByName(taskName: string, datasetName: string) {
        for (const dataset of this.datasets) {
            if (dataset.task === taskName && dataset.subtask === datasetName) {
                return dataset
            }
        }

        return undefined
    }

    private getTaskFromHierarchy(name: string) {
        for (const task of this.taskHierarchy) {
            if (task.task.task === name) {
                return task
            }
        }

        return undefined
    }

    private getDatasetFromTask(taskName: string, datasetName: string, datasets: AdapterHubHierarchyDataset[]) {
        for (const dataset of datasets) {
            if (dataset.dataset.task === taskName && dataset.dataset.subtask === datasetName) {
                return dataset
            }
        }

        return undefined
    }

    private filterUnusedAdapters() {
        this.adapters = this.adapters.filter((adapter) => this.isUsedTask(adapter.task) && adapter.prediction_head)
    }

    private isUsedTask(task: string): boolean {
        return (
            task === "sentiment" ||
            task === "nli" ||
            task === "lingaccept" ||
            task === "dialect" ||
            task === "argument" ||
            task === "sts"
        )
    }
}
