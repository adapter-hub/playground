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