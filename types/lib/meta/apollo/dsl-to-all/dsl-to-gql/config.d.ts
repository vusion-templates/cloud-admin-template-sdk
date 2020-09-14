import { JSONSchemaType, JSONSchemaTypes } from './json-schema';
import { EndpointParam, RequestOptions } from './getRequestOptions';
import { ResolverOptions } from './interfaceStructure';
import { GraphQLTypeMap } from "./typeMap";
import { GraphQLFieldConfigMap } from "graphql";
export interface GraphQLParameters {
    [key: string]: any;
}
export interface Responses {
    [key: string]: {
        schema?: JSONSchemaType;
        content?: {
            'application/json': {
                schema: JSONSchemaType;
            };
        };
        type?: 'file';
    };
}
export declare const getSuccessResponse: (responses: Responses) => JSONSchemaType | undefined;
export interface BodyParam {
    name: string;
    required?: boolean;
    schema: JSONSchemaType;
    in: 'body';
}
export interface Oa2NonBodyParam {
    name: string;
    type: JSONSchemaTypes;
    in: 'header' | 'query' | 'formData' | 'path';
    required?: boolean;
}
export interface Oa3Param {
    name: string;
    in: 'header' | 'query' | 'formData' | 'path';
    required?: boolean;
    schema: JSONSchemaType;
}
export declare type NonBodyParam = Oa2NonBodyParam | Oa3Param;
export declare type Param = BodyParam | NonBodyParam;
export interface OA3BodyParam {
    content: {
        'application/json'?: {
            schema: JSONSchemaType;
        };
        'application/x-www-form-urlencoded'?: {
            schema: JSONSchemaType;
        };
    };
    description?: string;
    required: boolean;
}
export declare const isOa3Param: (param: Param) => param is Oa3Param;
export declare const getParamDetails: (param: Param) => EndpointParam;
export declare const getParamDetailsFromRequestBody: (requestBody: OA3BodyParam) => EndpointParam[];
export interface Endpoint {
    parameters: EndpointParam[];
    description?: string;
    response: JSONSchemaType | undefined;
    resolverOptions: ResolverOptions;
    getRequestOptions: (args: GraphQLParameters) => RequestOptions;
    mutation: boolean;
}
export interface Endpoints {
    [operationId: string]: Endpoint;
}
export interface OperationObject {
    requestBody?: OA3BodyParam;
    description?: string;
    operationId?: string;
    parameters?: Param[];
    responses: Responses;
    consumes?: string[];
}
export declare type PathObject = {
    parameters?: Param[];
} & {
    [operation: string]: OperationObject;
};
export interface Variable {
    default?: string;
    enum: string[];
}
export interface ServerObject {
    url: string;
    description?: string;
    variables: {
        [key: string]: string | Variable;
    };
}
export interface Variable {
    default?: string;
    enum: string[];
}
export interface ServerObject {
    url: string;
    description?: string;
    variables: {
        [key: string]: string | Variable;
    };
}
export interface DSLSchema {
    [mirco: string]: {
        entities: {
            [key: string]: any;
        };
        structures: {
            [key: string]: any;
        };
    };
}
declare type Options<T> = {
    [K: string]: any;
};
export declare const getFields: <TContext>(endpoints: Endpoints, isMutation: boolean, gqlTypes: GraphQLTypeMap, { callBackend }: Options<TContext>) => GraphQLFieldConfigMap<any, any>;
export {};
