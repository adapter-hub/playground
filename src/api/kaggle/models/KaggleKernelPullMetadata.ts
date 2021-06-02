export interface KaggleKernelPullMetadata {
    author: string
    categoryIds: string[]
    competitionDataSources: string[]
    datasetDataSources: string[]
    enableGpu: boolean
    enableInternet: boolean
    id: number
    isPrivate: boolean
    kernelDataSources: string[]
    kernelType: "script" | "notebook"
    language: "python" | "r" | "rmarkdown"
    lastRunTime: string
    ref: string
    slug: string
    title: string
    totalVotes: number
}
