import { ClassType, Field, InputType, Int, ObjectType } from "type-graphql"

export type PaginatedResponse<T> = {
    items: Array<T>
    total: number
}

export const EmptyPaginatedResponse: PaginatedResponse<any> = {
    items: [],
    total: 0,
}

export function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
    @ObjectType(`Paginated${TItemClass.name}Response`)
    class PaginatedResponseClass {
        @Field((type) => [TItemClass])
        items!: TItem[]

        @Field((type) => Int)
        total!: number
    }
    return PaginatedResponseClass
}

@InputType()
export class PaginationInput {
    @Field((returns) => Int)
    page!: number

    @Field((returns) => Int)
    size!: number
}