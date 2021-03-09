export class KaggleKernelListItem {
    public readonly ref: string
    public readonly title: string
    public readonly author: string
    public readonly lastRunTime: string
    public readonly totalVotes: number

    constructor(ref: string, title: string, author: string, lastRunTime: string, totalVotes: number) {
        this.ref = ref
        this.title = title
        this.author = author
        this.lastRunTime = lastRunTime
        this.totalVotes = totalVotes
    }
}
