import { ObjectType, Field, registerEnumType, Int, InputType, Float } from "type-graphql"
import { Filter, generateFilterType } from "../filter"
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany, RelationId } from "typeorm"
import { KeyType } from "."
import { Project } from "./project"
import { DatabaseFile, File } from "./file"
import { TypeormLoader } from "type-graphql-dataloader"
import { PaginatedResponse } from "../pagination"
import { FileUpload, GraphQLUpload } from "graphql-upload"

@Entity()
@ObjectType()
export class Task {
    @PrimaryGeneratedColumn()
    @Field(() => KeyType)
    id!: KeyType

    @Column()
    @Field()
    @Filter("like")
    name!: string

    @Column()
    @Field(() => TaskType)
    @Filter("eq", () => Int)
    type!: TaskType

    @Column({ nullable: true })
    @Field(() => TaskStatus, { nullable: true })
    @Filter("eq", () => Int)
    status?: TaskStatus

    @Column({ nullable: true })
    @Field({ nullable: true })
    @Filter("eq")
    log?: string

    @Column()
    @Field(() => KeyType)
    @Filter("eq", () => KeyType)
    projectId!: KeyType

    @ManyToOne(() => Project, (project) => project.tasks, { onDelete: "CASCADE" })
    @JoinColumn({ name: "projectId" })
    @TypeormLoader((type) => Task, (task: Task) => task.projectId)
    @Field(() => Project)
    project!: Project

    @OneToMany(() => DatabaseFile, (file) => file.task)
    @TypeormLoader((type) => DatabaseFile, (task: Task) => task.fileIds)
    files!: Array<DatabaseFile>

    @RelationId((task: Task) => task.files)
    fileIds!: KeyType[]

    @Column({ nullable: true })
    @Field({ nullable: true })
    kernelId?: string
}

@ObjectType()
export class TaskOutput {
    @Field()
    log!: string

    @Field(() => [File])
    files!: Array<File>

    @Field(() => Float, { nullable: true })
    accuracy?: number

    @Field(() => Float, { nullable: true })
    f1?: number

    @Field({ nullable: true })
    error?: string

}

export enum TaskType {
    Prediction = 0,
    Training = 1,
    Clustering = 2,
}

registerEnumType(TaskType, {
    name: "TaskType",
})

export enum TaskStatus {
    Running,
    Queued,
    Complete,
    Error,
}

registerEnumType(TaskStatus, {
    name: "TaskStatus",
})

export const PaginatedTaskResponse = PaginatedResponse(Task)
export type PaginatedTaskResponse = InstanceType<typeof PaginatedTaskResponse>
export const TaskFilter = generateFilterType(Task)

@InputType()
export class NewTaskInput {
    @Field()
    name!: string

    @Field(() => KeyType)
    projectId!: KeyType
}

@InputType()
export class NewAdaterHubTaskInput extends NewTaskInput {
    @Field()
    trainingDataset!: string

    @Field()
    taskType!: string

    @Field()
    modelTransformerClass!: string

    @Field()
    modelName!: string

    @Field({ nullable: true })
    adapterArchitecture?: string

    @Field({ nullable: true })
    adapterGroupName?: string

    @Field({ nullable: true })
    nlpTaskType?: string

    @Field(() => GraphQLUpload, { nullable: true })
    file?: FileUpload
}

@InputType()
export class NewTrainingTaskInput extends NewAdaterHubTaskInput {
    @Field()
    learningRate!: number

    @Field()
    numTrainEpochs!: number
}

@InputType()
export class NewPredictionTaskInput extends NewAdaterHubTaskInput {
    @Field()
    sheetsColumnName!: string
}

@InputType()
export class NewClusteringTaskInput extends NewTaskInput {
    @Field()
    sheetsColumnName!: string

    @Field()
    nClusters!: number // must be 0 < n_clusters < n_data, must be int

    @Field(() => ClusteringTaskRepresentation)
    representation!: ClusteringTaskRepresentation

    @Field(() => ClusteringTaskMethod)
    method!: ClusteringTaskMethod
}

export enum ClusteringTaskRepresentation {
    tfidf,
    sbert,
}

registerEnumType(ClusteringTaskRepresentation, {
    name: "ClusteringTaskRepresentation",
})

export enum ClusteringTaskMethod {
    kmeans,
    agglomerative,
}

registerEnumType(ClusteringTaskMethod, {
    name: "ClusteringTaskMethod",
})

/*@InputType()
export class EditTaskInput {
    @Field(() => KeyType)
    id!: KeyType

    @Field({ nullable: true })
    name?: string
}*/
