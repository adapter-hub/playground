import { NonEmptyArray } from "type-graphql"
import { Connection } from "typeorm"
import { KeyType, Project, Task } from "../entities"
import { User } from "../services"
import { ProjectResolver } from "./project-resolver"
import { TaskResolver } from "./task-resolver"
import { UserResolver } from "./user-resolver"

export const Resolvers: NonEmptyArray<Function> = [UserResolver, TaskResolver, ProjectResolver]

export async function checkProjectAccess(connection: Connection, user: User, id: KeyType): Promise<void> {
    await connection.getRepository(Project).findOneOrFail({ where: { id, ownerUsername: user.username } })
}

export async function checkTaskAccess(connection: Connection, user: User, id: KeyType): Promise<void> {
    await connection
        .getRepository(Task)
        .createQueryBuilder("task")
        .where("task.id = :id", { id })
        .innerJoin("task.project", "project", "project.ownerUsername = :ownerUsername", {
            ownerUsername: user.username,
        })
        .getOneOrFail()
}
