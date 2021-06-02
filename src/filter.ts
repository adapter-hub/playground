import {
    Filter as FilterImport,
    generateFilterType as generateFilterTypeImport,
    FilterOperator,
} from "type-graphql-filter"
import { GraphQLScalarType } from "graphql"
import { ClassType, ObjectType, Field, FieldOptions } from "type-graphql"

//this file is just because type-graphql-filter uses graphql@14 and we use graphql@15 which have not matching types

export declare type ReturnTypeFunc = (type?: void) => GraphQLScalarType | Function

export const generateFilterType: (entity: any) => any = generateFilterTypeImport
export const Filter: (
    operators: FilterOperator | FilterOperator[],
    returnTypeFunction?: ReturnTypeFunc
) => PropertyDecorator = FilterImport as any
