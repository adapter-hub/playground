import { GraphQLBoolean } from "graphql"
import { Ctx, Query, Resolver } from "type-graphql"
import { ComputationServiceToken } from "../typeorm"
import { Inject } from "typedi"
import { ComputationService } from "../services"

@Resolver()
export class UserResolver {
    @Inject(ComputationServiceToken)
    private computationService!: ComputationService

    @Query(() => GraphQLBoolean)
    checkAuthentication(@Ctx() { credentials }: { credentials?: any }): Promise<boolean> {
        return this.computationService.checkAuthentication(credentials)
    }
}
