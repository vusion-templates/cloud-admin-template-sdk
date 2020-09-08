import { DSLSchema, Responses, GraphQLParameters, Endpoints } from "./getRequestOptions";
import { GraphQLSchema } from "graphql";
import { JSONSchemaType } from "./json-schema";
import { CallBackendArguments } from ".";
export declare function addTitlesToJsonSchemas(schema: DSLSchema): DSLSchema;
export interface Interfaces {
    [operationId: string]: Endpoint;
}
export declare const getSuccessResponse: (responses: Responses) => JSONSchemaType | undefined;
interface Options<TContext> {
    dslSchema: string;
    callBackend: (args: CallBackendArguments<TContext>) => Promise<any>;
}
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
export declare const getAllInterfaces: (schema: DSLSchema) => Endpoints;
export declare const schemaFromInferfaces: <TContext>(endpoints: Endpoints, options: Options<TContext>) => GraphQLSchema;
export {};
