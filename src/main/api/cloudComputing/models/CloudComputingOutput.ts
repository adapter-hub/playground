export interface CloudComputingOutput {
    getLog(): CloudComputingOutputLine[]
    getFiles(): CloudComputingOutputFile[]
}

export interface CloudComputingOutputLine {
    stream_name: string
    data: string
}

export interface CloudComputingOutputFile {
    fileName: string
    url: string
}
