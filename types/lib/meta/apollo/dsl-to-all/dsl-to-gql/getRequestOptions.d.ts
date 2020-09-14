import { JSONSchemaType } from './json-schema';
import { Param } from './interfaceStructure';
import { OA3BodyParam, Responses } from './confg';
export interface EndpointParam {
    required: boolean;
    type: 'header' | 'query' | 'formData' | 'path' | 'body';
    name: string;
    swaggerName: string;
    jsonSchema: JSONSchemaType;
}
export interface RequestOptionsInput {
    method: string;
    baseUrl: string | undefined;
    path: string;
    parameterDetails: EndpointParam[];
    parameterValues: {
        [key: string]: any;
    };
    formData?: boolean;
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
export declare function getRequestOptions({ method, baseUrl, path, parameterDetails, parameterValues, formData, }: RequestOptionsInput): RequestOptions;
