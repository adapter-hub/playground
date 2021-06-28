import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql"
import { Connection } from "typeorm"
import { KeyType, NewProjectInput, Project } from "../entities"
import { Inject } from "typedi"
import { GraphQLBoolean } from "graphql"
import { ConnectionToken } from "../typeorm"
import { checkProjectAccess } from "."
import { User } from "../services"

@Resolver((of) => Project)
export class ProjectResolver {
    @Inject(ConnectionToken)
    private connection!: Connection

    @Authorized()
    @Mutation((returns) => Project)
    public async addProject(@Ctx() { user }: { user: User }, @Arg("input") insert: NewProjectInput) {
        const {
            identifiers: [id],
        } = await this.connection.getRepository(Project).insert({
            ...insert,
            ownerUsername: user.username,
        })
        return await this.connection.getRepository(Project).findOne(id)
    }

    @Authorized()
    @Mutation((returns) => GraphQLBoolean)
    public async deleteProject(
        @Ctx() { user }: { user: User },
        @Arg("id", (type) => KeyType) id: KeyType
    ) {
        await checkProjectAccess(this.connection, user, id)
        await this.connection.getRepository(Project).delete(id)
        return true
    }

    @Authorized()
    @Query((returns) => [Project])
    public async getProjects(@Ctx() { user }: { user: User }) {
        const projects = await this.connection
            .getRepository(Project)
            .find({ where: { ownerUsername: user.username } })
        return projects
    }

    @Authorized()
    @Query((returns) => Project)
    public async getProject(@Ctx() { user }: { user: User }, @Arg("id", (type) => KeyType) id: KeyType) {
        await checkProjectAccess(this.connection, user, id)
        const project = await this.connection.getRepository(Project).findOneOrFail(id)
        return project
    }
}
