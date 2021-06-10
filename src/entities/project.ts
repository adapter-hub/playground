import { ObjectType, Field, InputType } from "type-graphql";
import { Filter, generateFilterType } from "../filter";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  RelationId,
} from "typeorm";
import { KeyType } from ".";
import { Task } from "./task";
import { TypeormLoader } from "type-graphql-dataloader";
import { PaginatedResponse } from "../pagination";

@Entity()
@ObjectType()
export class Project {
  @PrimaryGeneratedColumn()
  @Field(() => KeyType)
  id!: KeyType;

  @Column()
  @Field()
  @Filter("like")
  name!: string;

  @Column()
  @Field()
  @Filter("like")
  googleSheetId!: string;

  dateCreated!: Date;
  
  @Column()
  ownerUsername!: string

  @OneToMany(() => Task, (task) => task.project, { onDelete: "CASCADE" })
  @Field(() => [Task])
  @TypeormLoader((type) => Task, (project: Project) => project.taskIds)
  tasks!: Array<Task>;

  @Field(() => [KeyType])
  @RelationId((project: Project) => project.tasks)
  @Field(() => [KeyType])
  taskIds!: KeyType[];
}

export const PaginatedProjectResponse = PaginatedResponse(Project);
export type PaginatedProjectResponse = InstanceType<
  typeof PaginatedProjectResponse
>;
export const ProjectFilter = generateFilterType(Project);

@InputType()
export class NewProjectInput {
  @Field()
  name!: string;

  @Field()
  googleSheetId!: string;
}

/*@InputType()
export class EditProjectInput {

    @Field(() => KeyType)
    id!: KeyType

    @Field({ nullable: true })
    name?: string

}*/
