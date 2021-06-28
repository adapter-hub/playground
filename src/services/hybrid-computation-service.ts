import { FileUpload } from "graphql-upload"
import { Task, TaskStatus, TaskOutput } from "../entities"
import { ComputationService, User } from "./computation-service"
import { KaggleComputationService } from "./kaggle-computation-service"
import { LocalComputationService } from "./local-computation-service"

export class HybridComputationService implements ComputationService {
    constructor(
        private kaggleComputationService: KaggleComputationService,
        private localComputationService: LocalComputationService
    ) {}

    async checkAuthentication(credentials: any): Promise<User | undefined> {
        const localUser = await this.localComputationService.checkAuthentication(credentials)
        if (localUser != null) {
            return localUser
        }
        return await this.kaggleComputationService.checkAuthentication(credentials)
    }

    getTaskStatus(user: User, task: Task): Promise<TaskStatus> {
        if (user.type === "kaggle") {
            return this.kaggleComputationService.getTaskStatus(user, task)
        } else {
            return this.localComputationService.getTaskStatus(user, task)
        }
    }

    getTaskOutput(user: User, task: Task): Promise<TaskOutput | undefined> {
        if (user.type === "kaggle") {
            return this.kaggleComputationService.getTaskOutput(user, task)
        } else {
            return this.localComputationService.getTaskOutput(user, task)
        }
    }

    startTask(user: User, task: Task, code: string, file: string | undefined): Promise<void> {
        if (user.type === "kaggle") {
            return this.kaggleComputationService.startTask(user, task, code, file)
        } else {
            return this.localComputationService.startTask(user, task, code, file)
        }
    }

    uploadFile(user: User, file: FileUpload): Promise<string> {
        if (user.type === "kaggle") {
            return this.kaggleComputationService.uploadFile(user, file)
        } else {
            return this.localComputationService.uploadFile(user, file)
        }
    }
}
