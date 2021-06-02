export class KaggleKernelListRequest {
    private page?: number
    private pageSize?: number
    private search?: string
    private group?: "everyone" | "profile" | "upvoted"
    private user?: string
    private language?: "all" | "python" | "r" | "sqlite" | "julia"
    private kernelType?: "all" | "script" | "notebook"
    private outputType?: "all" | "visualization" | "data"
    private sortBy?:
        | "hotness"
        | "commentCount"
        | "dateCreated"
        | "dateRun"
        | "scoreAscending"
        | "scoreDescending"
        | "viewCount"
        | "voteCount"
        | "relevance"
    private dataset?: string
    private competition?: string
    private parentKernel?: string

    public setPage(page: number) {
        this.page = page
    }

    public setPageSize(pageSize: number) {
        this.pageSize = pageSize
    }

    public setSearch(search: string) {
        this.search = search
    }

    public setGroup(group: "everyone" | "profile" | "upvoted") {
        this.group = group
    }

    public setUser(user: string) {
        this.user = user
    }

    public setLanguage(language: "all" | "python" | "r" | "sqlite" | "julia") {
        this.language = language
    }

    public setKernelType(kernelType: "all" | "script" | "notebook") {
        this.kernelType = kernelType
    }

    public setOutputType(outputType: "all" | "visualization" | "data") {
        this.outputType = outputType
    }

    public setSortBy(
        sortBy:
            | "hotness"
            | "commentCount"
            | "dateCreated"
            | "dateRun"
            | "scoreAscending"
            | "scoreDescending"
            | "viewCount"
            | "voteCount"
            | "relevance"
    ) {
        this.sortBy = sortBy
    }

    public setDataset(dataset: string) {
        this.dataset = dataset
    }

    public setCompetition(competition: string) {
        this.competition = competition
    }

    public setParentKernel(parentKernel: string) {
        this.parentKernel = parentKernel
    }
}
