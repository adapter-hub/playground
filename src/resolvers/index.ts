import { NonEmptyArray } from "type-graphql"
import { Connection } from "typeorm"
import { KeyType, Project, Task } from "../entities"
import { ProjectResolver } from "./project-resolver"
import { TaskResolver } from "./task-resolver"
import { UserResolver } from "./user-resolver"

export const Resolvers: NonEmptyArray<Function> = [UserResolver, TaskResolver, ProjectResolver]

function hash(str: string) {
    let hash = 0,
        i,
        chr
    if (str.length === 0) return hash
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
    }
    return hash
}

export function hashCredentials(credentials: any): number {
    const { username, key } = credentials
    return hash(`${username}/${key}`)
}

export async function checkProjectAccess(connection: Connection, credentials: any, id: KeyType): Promise<void> {
    await connection.getRepository(Project).findOneOrFail({ where: { id, ownerHash: hashCredentials(credentials) } })
}

export async function checkTaskAccess(connection: Connection, credentials: any, id: KeyType): Promise<void> {
    await connection
        .getRepository(Task)
        .createQueryBuilder("task")
        .where("task.id = :id", { id })
        .innerJoin("task.project", "project", "project.ownerHash = :ownerHash", {
            ownerHash: hashCredentials(credentials),
        }).getOneOrFail()
}
