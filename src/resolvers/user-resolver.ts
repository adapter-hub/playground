import { GraphQLBoolean } from "graphql"
import { Ctx, Query, Resolver } from "type-graphql"
import { User } from "../services"

@Resolver()
export class UserResolver {
    @Query(() => GraphQLBoolean)
    async checkAuthentication(@Ctx() { user }: { user?: User }): Promise<boolean> {
        return user != null
    }
}
