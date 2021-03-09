export interface KaggleKernelPushResponse {
    ref: string | null
    url: string | null
    versionNumber: number | null
    error: string | null
    invalidTags: string[]
    invalidDatasetSources: string[]
    invalidCompetitionSources: string[]
    invalidKernelSources: string[]
}
