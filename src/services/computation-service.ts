import { Task, TaskStatus, TaskOutput } from "../entities"
import { FileUpload } from "graphql-upload"

export interface ComputationService {
    checkAuthentication(credentials: any): Promise<boolean>

    getTaskStatus(credentials: any, task: Task): Promise<TaskStatus>

    getTaskOutput(credentials: any, task: Task): Promise<TaskOutput | undefined>

    startTask(credentials: any, task: Task, code: string, file: string | undefined): Promise<void>

    uploadFile(credentials: any, file: FileUpload): Promise<string>
}
