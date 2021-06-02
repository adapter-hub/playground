import { Field, ObjectType } from "type-graphql"
import { Filter } from "type-graphql-filter"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { KeyType } from "."
import { Task } from "./task"

@ObjectType()
export class File {

    @Field()
    @Filter("like")
    name!: string

    @Field()
    @Filter("like")
    url!: string

}

@Entity()
@ObjectType()
export class DatabaseFile extends File {

    @PrimaryGeneratedColumn()
    id!: KeyType

    @Column()
    @Field()
    @Filter("like")
    name!: string

    @Column()
    @Field()
    @Filter("like")
    url!: string
    
    @Column()
    taskId!: KeyType

    @ManyToOne(() => Task, (task) => task.files, { onDelete: "CASCADE" })
    @JoinColumn({ name: "taskId" })
    task!: Task

}