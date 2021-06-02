import { ReadStream } from "node:fs"
import { ComputationService } from "."
import { Task, TaskStatus, TaskOutput } from "../entities"
import { PythonShell } from "python-shell"
import { Connection } from "typeorm"
import { FileUpload } from "graphql-upload"

export class LocalComputationService implements ComputationService {
    constructor(private connection: Connection) {}

    async checkAuthentication(credentials: any): Promise<boolean> {
        return this.isAuthenticated(credentials)
    }

    async getTaskStatus(credentials: any, task: Task): Promise<TaskStatus> {
        this.throwIfNotAuthenticated(credentials)
        if (task.status == null) {
            throw "task has no status (not created locally?)"
        }
        return task.status
    }

    async getTaskOutput(credentials: any, task: Task): Promise<TaskOutput> {
        this.throwIfNotAuthenticated(credentials)
        return {
            f1: 0,
            accuracy: 0,
            log: task.log ?? "",
            files: task.files ?? [],
        }
    }

    async startTask(credentials: any, task: Task, code: string, file: string | undefined): Promise<void> {
        this.throwIfNotAuthenticated(credentials)
        const repo = this.connection.getRepository(Task)
        task.status = TaskStatus.Running
        await repo.save(task)
        PythonShell.runString(code, undefined, (error, output) => {
            if (error) {
                task.status = TaskStatus.Error
                console.error(error.message)
            } else {
                task.status = TaskStatus.Complete
                task.log = output?.join("\n")
            }
            repo.save(task)
        })
    }

    uploadFile(credentials: any, file: FileUpload): Promise<string> {
        this.throwIfNotAuthenticated(credentials)
        throw "not implemented"
    }

    private throwIfNotAuthenticated(credentials: any) {
        if (!this.isAuthenticated(credentials)) {
            throw "not authenticated"
        }
    }

    private isAuthenticated(credentials: any) {
        if (credentials.username === "admin" && credentials.key === "admin") {
            return true
        }
        return false
    }
}
