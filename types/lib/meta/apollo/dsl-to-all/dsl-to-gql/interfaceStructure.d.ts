import { DSLSchema, Responses, GraphQLParameters, Endpoints, Oa2NonBodyParam } from "./confg";
import { GraphQLSchema } from "graphql";
import { JSONSchemaType } from "./json-schema";
export declare function addTitlesToJsonSchemas(schema: DSLSchema): DSLSchema;
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
export declare const getParamDetails: (param: Oa2NonBodyParam) => StructureParam;
export declare const getSuccessResponse: (responses: Responses) => JSONSchemaType | undefined;
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
export declare const getServerPath: (schema: DSLSchema) => string | undefined;
/**
 * 获取全部 stucture
 * 创建关联关系
 *
 * @param schema
 */
export declare const getAllInterfaces: (schema: DSLSchema) => Endpoints;
export declare const schemaFromStructures: <TContext>(endpoints: Endpoints, options: any) => GraphQLSchema;
export {};
