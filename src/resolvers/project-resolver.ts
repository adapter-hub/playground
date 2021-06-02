import { Arg, Authorized, Mutation, Query, Resolver } from "type-graphql"
import { Connection } from "typeorm"
import { KeyType, NewProjectInput, Project } from "../entities"
import { Inject } from "typedi"
import { GraphQLBoolean } from "graphql"
import { ConnectionToken } from "../typeorm"

@Resolver((of) => Project)
export class ProjectResolver {
    @Inject(ConnectionToken)
    private connection!: Connection

    @Authorized()
    @Mutation((returns) => Project)
    public async addProject(@Arg("input") insert: NewProjectInput) {
        const {
            identifiers: [id],
        } = await this.connection.getRepository(Project).insert(insert)
        return await this.connection.getRepository(Project).findOne(id)
    }

    @Authorized()
    @Mutation((returns) => GraphQLBoolean)
    public async deleteProject(@Arg("id", (type) => KeyType) id: KeyType) {
        await this.connection.getRepository(Project).delete(id)
        return true
    }

    @Authorized()
    @Query((returns) => [Project])
    public async getProjects() {
        const projects = await this.connection.getRepository(Project).find()
        return projects
    }

    @Authorized()
    @Query((returns) => Project)
    public async getProject(@Arg("id", (type) => KeyType) id: KeyType) {
        const project = await this.connection.getRepository(Project).findOneOrFail(id)
        return project
    }
}
