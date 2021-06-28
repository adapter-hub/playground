import { Task, TaskStatus, TaskOutput } from "../entities"
import { FileUpload } from "graphql-upload"

export type User =
    | {
          type: "kaggle"
          username: string
          key: string
      }
    | {
          username: string
          type: "local"
      }

export type PlatformType = "local" | "kaggle"

export interface ComputationService {
    
    readonly platformType: PlatformType

    checkAuthentication(credentials: any): Promise<User | undefined>

    getTaskStatus(user: User, task: Task): Promise<TaskStatus>

    getTaskOutput(user: User, task: Task): Promise<TaskOutput | undefined>

    startTask(user: User, task: Task, code: string, file: string | undefined): Promise<void>

    uploadFile(user: User, file: FileUpload): Promise<string>
}
