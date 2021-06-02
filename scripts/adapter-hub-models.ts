export interface AdapterHubHierarchy {
    task: AdapterHubTask
    datasets: AdapterHubHierarchyDataset[]
}

export interface AdapterHubHierarchyDataset {
    dataset: AdapterHubDataset
    adapters: AdapterHubAdapter[]
}

export interface AdapterHubTask {
    task: string
}

export interface AdapterHubDataset {
    task: string
    subtask: string
}

export interface AdapterHubAdapter {
    task: string
    subtask: string
    prediction_head: boolean
    model_class?: string
    model_type?: string
    model_name?: string
    config?: { using?: string }
    groupname: string
    type: string
}
