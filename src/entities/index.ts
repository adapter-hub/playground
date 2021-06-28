import { Int } from "type-graphql"

export type KeyType = number
export const KeyType = Int

export * from "./project"
export * from "./task"

import { Task } from "./task"
import { Project } from "./project"

export const Entities = [Task, Project]

export type Entity = Task | Project
