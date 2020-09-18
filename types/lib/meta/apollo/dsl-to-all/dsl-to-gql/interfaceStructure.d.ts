import { DSLSchema, Oa3Param, Responses, GraphQLParameters, Endpoints, Oa2NonBodyParam } from "./config";
import { GraphQLSchema } from "graphql";
import { JSONSchemaType } from "./json-schema";
export interface Param {
    required: boolean;
    type: 'header' | 'query' | 'formData' | 'path' | 'body';
    name: string;
    swaggerName: string;
    jsonSchema: JSONSchemaType;
}
interface StructureParam {
    required: boolean;
    type: 'header' | 'query' | 'formData' | 'path' | 'body';
    name: string;
    swaggerName: string;
    jsonSchema: JSONSchemaType;
}
export interface Interfaces {
    [operationId: string]: Endpoint;
}
export declare const getParamDetails: (param: Oa3Param | Oa2NonBodyParam) => StructureParam;
export declare const getSuccessExample: (responses: Responses) => JSONSchemaType | undefined;
export declare const getSuccessResponse: (responses: Responses) => JSONSchemaType | undefined;
export declare const getEntityResponse: (responses?: Responses) => JSONSchemaType | undefined;
export interface EndpointParam {
    required: boolean;
    type: 'header' | 'query' | 'formData' | 'path' | 'body';
    name: string;
    swaggerName: string;
    jsonSchema: JSONSchemaType;
}
export interface Endpoint {
    parameters: EndpointParam[];
    description?: string;
    response: JSONSchemaType | undefined;
    getRequestOptions: (args: GraphQLParameters) => RequestOptions;
    mutation: boolean;
    resolverOptions: ResolverOptions;
}
export interface ResolverOptions {
    baseUrl: string;
    path: string;
    extendConfig: any;
    query: Param[];
}
export interface Response {
    parameters: EndpointParam[];
    description?: string;
    response: JSONSchemaType | undefined;
    getRequestOptions: (args: GraphQLParameters) => RequestOptions;
    mutation: boolean;
    schema: JSONSchemaType;
}
export interface RequestOptions {
    baseUrl?: string;
    path: string;
    method: string;
    headers?: {
        [key: string]: string;
    };
    query?: {
        [key: string]: string | string[];
    };
    body?: any;
    bodyType: 'json' | 'formData';
}
/**
 * 获取全部 stucture
 * 创建关联关系
 *
 * @param schema
 */
export declare const getAllInterfaces: (schema?: DSLSchema) => {
    [key: string]: any;
};
declare type Options<T> = {
    [K in keyof T]: K extends 'context' ? T[K] : number;
};
export declare const schemaFromStructures: <TContext>(endpoints: Endpoints, options: Options<TContext>) => GraphQLSchema;
export {};
