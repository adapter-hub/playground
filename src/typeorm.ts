import { Connection, createConnection } from "typeorm"
import { Entities } from "./entities"

export const ConnectionToken = "connection"
export const ComputationServiceToken = "computation-service"

const DB_NAME = process.env.DB_NAME!
const DB_HOST = process.env.DB_HOST!
const DB_PORT = +process.env.DB_PORT!
const DB_USERNAME = process.env.DB_USERNAME!
const DB_PASSWORD = process.env.DB_PASSWORD!
const DB_SOCKET_PATH = process.env.DB_SOCKET_PATH

export async function initializeConnection(): Promise<Connection> {
    return await createConnection({
        ...(DB_SOCKET_PATH != null
            ? {
                  extra: {
                      socketPath: DB_SOCKET_PATH,
                  },
              }
            : {
                  host: DB_HOST,
                  port: DB_PORT,
              }),
        type: "mysql",
        timezone: "Z",
        database: DB_NAME,
        username: DB_USERNAME,
        password: DB_PASSWORD,
        entities: Entities,
        cache: false,
        synchronize: false,
        logging: ["error"],
    })
}
