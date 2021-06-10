import { NonEmptyArray } from "type-graphql"
import { Connection } from "typeorm"
import { KeyType, Project, Task } from "../entities"
import { ProjectResolver } from "./project-resolver"
import { TaskResolver } from "./task-resolver"
import { UserResolver } from "./user-resolver"

export const Resolvers: NonEmptyArray<Function> = [UserResolver, TaskResolver, ProjectResolver]

export async function checkProjectAccess(connection: Connection, credentials: any, id: KeyType): Promise<void> {
    await connection.getRepository(Project).findOneOrFail({ where: { id, ownerUsername: credentials.username } })
}

export async function checkTaskAccess(connection: Connection, credentials: any, id: KeyType): Promise<void> {
    await connection
        .getRepository(Task)
        .createQueryBuilder("task")
        .where("task.id = :id", { id })
        .innerJoin("task.project", "project", "project.ownerUsername = :ownerUsername", {
            ownerUsername: credentials.username,
        }).getOneOrFail()
}
