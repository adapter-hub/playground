import { Int } from "type-graphql"

export type KeyType = number
export const KeyType = Int

export * from "./project"
export * from "./task"
export * from "./file"

import { Task } from "./task"
import { DatabaseFile } from "./file"
import { Project } from "./project"

export const Entities = [DatabaseFile, Task, Project]

export type Entity = DatabaseFile | Task | Project
