import { GraphQLBoolean, GraphQLInt, GraphQLString } from "graphql"
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql"
import {
    KeyType,
    NewAdaterHubTaskInput,
    NewPredictionTaskInput,
    NewClusteringTaskInput,
    NewTaskInput,
    NewTrainingTaskInput,
    Project,
    Task,
    TaskOutput,
    TaskStatus,
    TaskType,
} from "../entities"
import { Inject } from "typedi"
import { Connection } from "typeorm"
import { ComputationServiceToken, ConnectionToken } from "../typeorm"
import { ComputationService } from "../services"
import { generateCode } from "../code-generation/main"
import { v4 as uuidv4 } from "uuid"
import { generateClusteringCode } from "../code-generation/clustering"
import { FileUpload } from "graphql-upload"
import { checkProjectAccess, checkTaskAccess } from "."

const sheetsAccessToken = `{"type": "service_account","project_id": "testsheets-297914","private_key_id": "5ea165b82d629bac7c1fe35f3935e1db6f1175ae","private_key": "-----BEGIN PRIVATE KEY-----\\\\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCj3XWZP6+6Uhyh\\\\nAPUaldFsCp7b9yGvLnJuv+AyKyyJ6kpL0wqFiovhLoLgKRXQ57V4M3ZeoaU/XAkP\\\\nWHO8P71T/YcrtMK1UP5kMg4axYb+oJirIAiy1IUmAp4vjlGcosulYlMcURawOASP\\\\nj/bZA19F9/tvL5GDcH9lRdzQPPK8rD20udaSWHeJ2uM3e0irsM2co+KTWnX4D8tb\\\\nWWolxIEQtd3158udG3KxligNBrT+6EIGg2iPTsFyD3JvAZkwP6aFJmqr+9LSXcJ7\\\\nhYnRevldRVVjkOfG84nPwPkmFYAwT8RFa4gmp3wWajqbO89S1y2kM5uHz6qEX8lh\\\\nH9cdbJ2RAgMBAAECggEABbaZ/A7hZKCqSN7MrPGeTKMOKOMz9HStHrln6rfgpKpb\\\\njss76a4L9Hz3qTMlhJQfmqJItUHzjgL6eeN+nYinZD9JsDdsNoAtbnbkUQCkFUqq\\\\nKAVE6F9KiSm8NDJFHC385bZI6YrWPKynVA4T8DsS3lCoHpdM/oU0m+ZUrZoCaJuW\\\\nbAnepWabGywyDiMV2qb5OpZnVYPVPpsWk/+xOTmerAQFW98Q+LAiUG+UOskSed+l\\\\nCEcQi/CqS6AiGPC/W/QltXMSd//a5GryHVpNdJ6z2xdc+miKIPZqyai1W7CNiZyD\\\\nNKPOb+whtzHUdX0sRaf0W4QV5QzjaCV4LJ182laRJQKBgQDitP6kwn98bTZV8eOm\\\\nRGKGsx3ED18enb2FCB+1gtW7xjkXwTKCNLMUgIoYx1wCc+qDuxuV5KN6gZgNID5s\\\\nqIdpISoaS+M44u5Rygx8Qn6WA20hsc1hlRi8tuAm24vP9kmKN64mNBqcEfVevlyp\\\\nnvPpwMCZLWDW/3BIfNyDe+HKEwKBgQC5CcgdKsqyFwHZ+oNbZxnbocApgQzYeuLk\\\\nLDT5qMasdcRvR17QNqb+yTPem60FV8cUrqhf8To1F9rNRJWnd05K4UPp2vZUqsan\\\\n5KBJZNfPtj+26bkoJCARGAnTB+MRHliXz1W92Lfv48sNdWR+5taajQVH6Wn1IDrd\\\\n+7dXrw0uSwKBgAVfRp1+4mh/agc1WTCqdC8+9VidCKMAF+qcG6xAcnIlq1qtwFWn\\\\njArTVPJrXvnL52XBvFCb/2e6xHCjL/eBMtxB5e6Dl9nUPtN/VzZmmPtTD3X58aT7\\\\nVH+8Ual6EGEYM/vrf9v15h+GqWraVfXLB3qlj6rRkXbmzLFbDBqth9czAoGAIQAF\\\\nmG4RSEGiKuXql1qD2g+23bAOQm1oGZlouT3IcOlv5wireCbHEZmAjqrk6JcHAkFD\\\\n9hhncSCX/RPGPN+iLuiN3B8Y33C1jSvRCkXZ10mBg3Wbd/U5YtMOrXwymtL2qdxo\\\\nRjtoUngltnjBO4CftWCBGJogM39UAFLsF884YpECgYANj5q/R1R0tpVagcfPzF8+\\\\nnNwG2ohkdR9q5RQrCU7Vopvzd2MYssk0LIOnAlhSqeYQk2VMyqAfERpdf9dUPqfe\\\\njqFe0lNZHIDcy1592oB8MUQ8aDAcntH+vwWUW1feGPVLp1AlyQ8Dkcu+IPR2k1jp\\\\n8UwhxeJSjADqQ55Jzjuizg==\\\\n-----END PRIVATE KEY-----\\\\n","client_email": "hanz-590@testsheets-297914.iam.gserviceaccount.com","client_id": "103458971298238973578","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/hanz-590%40testsheets-297914.iam.gserviceaccount.com"}`

@Resolver((of) => Task)
export class TaskResolver {
    @Inject(ConnectionToken)
    private connection!: Connection

    @Inject(ComputationServiceToken)
    private computationService!: ComputationService

    @Authorized()
    @Query((returns) => Task)
    public async getTask(@Ctx() { credentials }: { credentials?: any }, @Arg("id", (type) => KeyType) id: KeyType) {
        await checkTaskAccess(this.connection, credentials, id)
        const project = await this.connection.getRepository(Task).findOneOrFail(id)
        return project
    }

    @Authorized()
    @Mutation((returns) => Task)
    public async addClusteringTask(@Ctx() { credentials }: any, @Arg("input") input: NewClusteringTaskInput) {
        await checkProjectAccess(this.connection, credentials, input.projectId)
        const project = await this.connection.getRepository(Project).findOneOrFail(input.projectId)
        const code = generateClusteringCode(input, spreadSheetIdToLink(project.googleSheetId), sheetsAccessToken)
        return await this.addTask(
            credentials,
            {
                type: TaskType.Clustering,
                ...input,
            },
            code,
            undefined
        )
    }

    @Authorized()
    @Mutation((returns) => Task)
    public async addTrainingTask(@Ctx() { credentials }: any, @Arg("input") input: NewTrainingTaskInput) {
        await checkProjectAccess(this.connection, credentials, input.projectId)
        const project = await this.connection.getRepository(Project).findOneOrFail(input.projectId)
        let filePath: string | undefined
        if (input.file != null) {
            const file = await input.file
            filePath = await this.computationService.uploadFile(credentials, file)
        }
        const code = generateCode({
            doTraining: true,
            ...input,
            ...assureAdapterConfiguration(input, filePath),
            sheetsAccessToken,
            sheetsDocumentURL: spreadSheetIdToLink(project.googleSheetId),
        })
        return await this.addTask(
            credentials,
            {
                type: TaskType.Training,
                ...input,
            },
            code,
            filePath
        )
    }

    @Authorized()
    @Mutation((returns) => Task)
    public async addPredictionTask(@Ctx() { credentials }: any, @Arg("input") input: NewPredictionTaskInput) {
        await checkProjectAccess(this.connection, credentials, input.projectId)
        const project = await this.connection.getRepository(Project).findOneOrFail(input.projectId)
        let filePath: string | undefined
        if (input.file != null) {
            const file = await input.file
            filePath = await this.computationService.uploadFile(credentials, file)
        }
        const code = generateCode({
            doTraining: false,
            ...input,
            ...assureAdapterConfiguration(input, filePath),
            sheetsAccessToken,
            sheetsDocumentURL: spreadSheetIdToLink(project.googleSheetId),
        })
        return await this.addTask(
            credentials,
            {
                type: TaskType.Prediction,
                ...input,
            },
            code,
            filePath
        )
    }

    @FieldResolver(() => TaskStatus)
    public async status(@Ctx() { credentials }: any, @Root() task: Task) {
        await checkTaskAccess(this.connection, credentials, task.id)
        return this.computationService.getTaskStatus(credentials, task)
    }

    @FieldResolver(() => TaskOutput, { nullable: true })
    public async output(@Ctx() { credentials }: any, @Root() task: Task) {
        await checkTaskAccess(this.connection, credentials, task.id)
        return this.computationService.getTaskOutput(credentials, task)
    }

    private async addTask(
        credentials: any,
        input: NewTaskInput & { type: TaskType },
        code: string,
        filePath: string | undefined
    ) {
        const kernelId = uuidv4()
        const task = await this.connection.getRepository(Task).save({
            ...input,
            kernelId,
        })
        await this.computationService.startTask(credentials, task, code, filePath)
        return await this.connection.getRepository(Task).findOne(task.id)
    }

    @Authorized()
    @Mutation((returns) => GraphQLBoolean)
    public async deleteTask(@Ctx() { credentials }: { credentials?: any }, @Arg("id", (type) => KeyType) id: KeyType) {
        await checkTaskAccess(this.connection, credentials, id)
        await this.connection.getRepository(Task).delete(id)
        return true
    }
}

function spreadSheetIdToLink(id: string): string {
    return `https://docs.google.com/spreadsheets/d/${id}`
}

function assureAdapterConfiguration(
    input: NewAdaterHubTaskInput,
    filePath: string | undefined
):
    | {
          useOwnAdapter: false
          adapterArchitecture: string
          adapterGroupName: string
          nlpTaskType: string
      }
    | {
          useOwnAdapter: true
          zipFileName: string
      } {
    if (filePath != null) {
        return {
            useOwnAdapter: true,
            zipFileName: filePath,
        }
    }
    if (input.adapterArchitecture != null && input.adapterGroupName != null && input.nlpTaskType != null) {
        return {
            useOwnAdapter: false,
            adapterArchitecture: input.adapterArchitecture,
            adapterGroupName: input.adapterGroupName,
            nlpTaskType: input.nlpTaskType,
        }
    }
    throw new Error("adapter configuration incomplete")
}
