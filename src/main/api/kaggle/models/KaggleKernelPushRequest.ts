export class KaggleKernelPushRequest {
    private slug: string
    private newTitle?: string
    private text: string
    private language: "python" | "r" | "rmarkdown"
    private kernelType: "script" | "notebook"
    private isPrivate?: boolean
    private enableGpu?: boolean
    private enableInternet?: boolean
    private datasetDataSources?: string[]
    private competitionDataSources?: string[]
    private kernelDataSources?: string[]
    private categoryIds?: string[]
    private dockerImagePinningType?: "original" | "latest"

    constructor(
        username: string,
        slug: string,
        text: string,
        language: "python" | "r" | "rmarkdown",
        kernelType: "script" | "notebook"
    ) {
        this.slug = username + "/" + slug
        this.text = text
        this.language = language
        this.kernelType = kernelType

        this.setNewTitle(slug)
    }

    public setNewTitle(newTitle: string) {
        this.newTitle = newTitle
    }

    public setIsPrivate(isPrivate: boolean) {
        this.isPrivate = isPrivate
    }

    public setEnableGpu(enableGpu: boolean) {
        this.enableGpu = enableGpu
    }

    public setEnableInternet(enableInternet: boolean) {
        this.enableInternet = enableInternet
    }

    public setDatasetDataSources(datasetDataSources: string[]) {
        this.datasetDataSources = datasetDataSources
    }

    public setCompetitionDataSources(competitionDataSources: string[]) {
        this.competitionDataSources = competitionDataSources
    }

    public setKernelDataSources(kernelDataSources: string[]) {
        this.kernelDataSources = kernelDataSources
    }

    public setCategoryIds(categoryIds: string[]) {
        this.categoryIds = categoryIds
    }

    public setDockerImagePinningType(dockerImagePinningType: "original" | "latest") {
        this.dockerImagePinningType = dockerImagePinningType
    }
}
