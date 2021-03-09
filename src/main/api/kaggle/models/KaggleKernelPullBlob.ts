export interface KaggleKernelPullBlob {
    kernelType: "script" | "notebook"
    language: "python" | "r" | "rmarkdown"
    slug: string
    source: string
}
