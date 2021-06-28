import { mkdir, readdir, stat, readFile } from "fs/promises"
import { ComputationService, PlatformType, User } from "."
import { Task, TaskStatus, TaskOutput } from "../entities"
import { PythonShell } from "python-shell"
import { Connection } from "typeorm"
import { FileUpload } from "graphql-upload"
import { resolve, join } from "path"
import { SERVER_URL } from ".."
import { createWriteStream } from "fs"
import { v4 as uuidv4 } from "uuid"

export class LocalComputationService implements ComputationService {
    constructor(private connection: Connection) {}

    getPlatformType(user: User): PlatformType {
        return "local"
    }

    private getTaskPath(task: Task): string {
        return resolve(__dirname, `../../files/tasks/${task.id}`)
    }

    async checkAuthentication(credentials: any): Promise<User | undefined> {
        if (credentials.username === "admin" && credentials.key === "admin") {
            return { type: "local", username: credentials.username }
        }
        return undefined
    }

    async getTaskStatus(user: User, task: Task): Promise<TaskStatus> {
        this.throwIfNotAuthenticated(user)
        if (task.status == null) {
            throw "task has no status (not created locally?)"
        }
        return task.status
    }

    async getTaskOutput(user: User, task: Task): Promise<TaskOutput> {
        this.throwIfNotAuthenticated(user)
        const path = this.getTaskPath(task)
        const filePaths = await (
            await readdir(path)
        ).reduce(async (promise, filePath) => {
            if ((await stat(join(path, filePath))).isDirectory()) {
                return promise
            }
            return [filePath, ...(await promise)]
        }, Promise.resolve<Array<string>>([]))

        let f1 = 0
        let accuracy = 0

        if (filePaths.includes("metadata.txt")) {
            const metadata = await (await readFile(join(path, "metadata.txt"))).toString()
            const split = metadata.split("\n")
            f1 = tryParseFloat(split[1]) ?? 0
            accuracy = tryParseFloat(split[2]) ?? 0
        }

        return {
            f1,
            accuracy,
            log: task.log ?? "",
            files: filePaths.map((filePath) => ({
                name: filePath,
                url: `${SERVER_URL}${join(`/files/tasks/${task.id}`, filePath)}`,
            })),
        }
    }

    async startTask(user: User, task: Task, code: string, file: string | undefined): Promise<void> {
        this.throwIfNotAuthenticated(user)
        const repo = this.connection.getRepository(Task)
        task.status = TaskStatus.Running
        const path = this.getTaskPath(task)
        await mkdir(path)
        await repo.save(task)
        let output = ""
        PythonShell.runString(
            code,
            {
                cwd: path,
            },
            (error) => {
                task.log = output
                if (error) {
                    task.status = TaskStatus.Error
                } else {
                    task.status = TaskStatus.Complete
                }
                repo.save(task)
            }
        )
            .on("stderr", (error) => {
                console.error(error)
                output += "\n" + error
            })
            .on("message", (msg) => {
                console.log(msg)
                output += "\n" + msg
            })
    }

    async uploadFile(user: User, file: FileUpload): Promise<string> {
        const fileName = `${uuidv4()}_${file.filename}`
        const path = resolve(__dirname, "../../files/upload", fileName)
        const readStream = file.createReadStream()
        const writeStream = createWriteStream(path)
        const stream = readStream.pipe(writeStream)
        await new Promise((resolve, reject) => stream.on("finish", resolve).on("error", reject))
        return `../../upload/${fileName}`
    }

    private throwIfNotAuthenticated(user: User) {
        if (!this.isAuthenticated(user)) {
            throw "not authenticated"
        }
    }

    private isAuthenticated(user: User) {
        return user != null && user.type === "local"
    }
}

function tryParseFloat(val: string): number | undefined {
    const result = parseFloat(val)
    return isNaN(result) ? undefined : result
}
