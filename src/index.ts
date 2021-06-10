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
import { createServer as createHttpServer, Server as HttpServer } from "http"
import { createServer as createHttpsServer, Server as HttpsServer } from "https"
import { readFile } from "fs/promises"

const { PORT, PROTOCOL } = process.env
const port = PORT || 80
var protocol = PROTOCOL || "https"

async function main() {
    const connection = await initializeConnection()
    Container.set(ConnectionToken, connection)

    const computationService = new KaggleComputationService() //new LocalComputationService(connection)
    Container.set(ComputationServiceToken, computationService)

    const typeormLoaderApolloServerPlugin = ApolloServerLoaderPlugin({
        typeormGetConnection: () => connection,
    })

    const schema = await buildSchema({
        resolvers: Resolvers,
        container: Container,
        authChecker: (data) => computationService.checkAuthentication(data.context.credentials),
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

    let server: HttpServer | HttpsServer
    if (protocol == "https") {
        var privateKey = await readFile("ssl.key", "utf8")
        var certificate = await readFile("ssl.crt", "utf8")
        server = createHttpsServer({ key: privateKey, cert: certificate }, app.callback())
    } else {
        server = createHttpServer(app.callback())
    }

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
    }).applyMiddleware({ app: app as any })

    server.listen(port, () => {
        console.log(`🚀  Server ready at ${PROTOCOL}://0.0.0.0:${port}`)
    })
}

main().catch(console.error)
