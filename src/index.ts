import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { Resolvers } from "./resolvers"
import { ComputationServiceToken, ConnectionToken, initializeConnection } from "./typeorm"
import { Container } from "typedi"
import { ApolloServerLoaderPlugin } from "type-graphql-dataloader"
import { KaggleComputationService } from "./services/kaggle-computation-service"
import * as Koa from "koa"
import { graphqlUploadKoa } from "graphql-upload"
import { ApolloServer } from "apollo-server-koa"
import * as cors from "@koa/cors"
import { LocalComputationService } from "./services/local-computation-service"

async function main() {
    const connection = await initializeConnection()
    Container.set(ConnectionToken, connection)

    const computationService = new KaggleComputationService()//new LocalComputationService(connection)
    Container.set(ComputationServiceToken, computationService)

    const typeormLoaderApolloServerPlugin = ApolloServerLoaderPlugin({
        typeormGetConnection: () => connection,
    })

    const schema = await buildSchema({
        resolvers: Resolvers,
        container: Container,
        authChecker: (data) => computationService.checkAuthentication(data.context.credentials)
    })

    const app = new Koa().use(
        graphqlUploadKoa({
            // Limits here should be stricter than config for surrounding
            // infrastructure such as Nginx so errors can be handled elegantly by
            // `graphql-upload`:
            // https://github.com/jaydenseric/graphql-upload#type-processrequestoptions
            maxFileSize: 10000000, // 10 MB
            maxFiles: 20,
        })
    )

    app.use(
        cors({
            credentials: true,
        })
    )

    new ApolloServer({
        schema,
        uploads: false,
        plugins: [typeormLoaderApolloServerPlugin],
        context: ({ ctx: { req } }) => {
            try {
                const json = req.headers.authorization
                const credentials = JSON.parse(json)
                return { credentials }
            } catch {
                return {}
            }
        },
    }).applyMiddleware({ app })

    app.listen(4000, () => {
        console.log(`🚀  Server ready at http://localhost:4000`)
    })
}

main().catch(console.error)
