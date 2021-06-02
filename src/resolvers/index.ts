import { NonEmptyArray } from "type-graphql"
import { ProjectResolver } from "./project-resolver"
import { TaskResolver } from "./task-resolver"
import { UserResolver } from "./user-resolver"

export const Resolvers: NonEmptyArray<Function> = [
    UserResolver,
    TaskResolver,
    ProjectResolver
]