import { JSONSchemaType, JSONSchemaTypes, isObjectType } from './json-schema';
import {
  EndpointParam,
  RequestOptions,
} from './getRequestOptions';
import { ResolverOptions } from './interfaceStructure';
import { jsonSchemaTypeToGraphQL, mapParametersToFields, GraphQLTypeMap } from "./typeMap";
import { parseResponse } from ".";
import { GraphQLFieldConfig, GraphQLResolveInfo, GraphQLFieldConfigMap } from "graphql";

export interface GraphQLParameters {
  [key: string]: any;
}

const replaceOddChars = (str: string): string =>
  str.replace(/[^_a-zA-Z0-9]/g, '_');

export interface Responses {
  [key: string]: {
    schema?: JSONSchemaType;
    content?: {
      'application/json': { 
        schema: JSONSchemaType;
        examples: {
          default: any;
        };
      };
    };
    type?: 'file';
  };
}

export const getSuccessResponse = (
  responses: Responses,
): JSONSchemaType | undefined => {
  const successCode = Object.keys(responses).find(code => {
    return code[0] === '2';
  });

  if (!successCode) {
    return undefined;
  }

  const successResponse = responses[successCode];
  if (!successResponse) {
    throw new Error(`Expected responses[${successCode}] to be defined`);
  }
  if (successResponse.schema) {
    return successResponse.schema;
  }

  if (successResponse.content) {
    return successResponse.content['application/json'].schema;
  }

  return undefined;
};

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

export type NonBodyParam = Oa2NonBodyParam | Oa3Param;

export type Param = BodyParam | NonBodyParam;

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

export const isOa3Param = (param: Param): param is Oa3Param => {
  return !!(param as Oa3Param).schema;
};

export const getParamDetails = (param: Param): EndpointParam => {
  const name = replaceOddChars(param.name);
  const swaggerName = param.name;
  if (isOa3Param(param)) {
    const { schema, required, in: type } = param as Oa3Param;
    return {
      name,
      swaggerName,
      type,
      required: !!required,
      jsonSchema: schema,
    };
  }

  return {
    name,
    swaggerName,
    type: param.in,
    required: !!param.required,
    jsonSchema: param,
  };
};

const contentTypeFormData = 'application/x-www-form-urlencoded';
export const getParamDetailsFromRequestBody = (
  requestBody: OA3BodyParam,
): EndpointParam[] => {
  const formData = requestBody.content[contentTypeFormData];
  function getSchemaFromRequestBody(): JSONSchemaType {
    if (requestBody.content['application/json']) {
      return requestBody.content['application/json'].schema;
    }
    throw new Error(
      `Unsupported content type(s) found: ${Object.keys(
        requestBody.content,
      ).join(', ')}`,
    );
  }
  if (formData) {
    const formdataSchema = formData.schema;
    if (!isObjectType(formdataSchema)) {
      throw new Error(
        `RequestBody is formData, expected an object schema, got "${JSON.stringify(
          formdataSchema,
        )}"`,
      );
    }
    return Object.entries(formdataSchema.properties).map<EndpointParam>(
      ([name, schema]) => ({
        name: replaceOddChars(name),
        swaggerName: name,
        type: 'formData',
        required: formdataSchema.required
          ? formdataSchema.required.includes(name)
          : false,
        jsonSchema: schema,
      }),
    );
  }
  return [
    {
      name: 'body',
      swaggerName: 'requestBody',
      type: 'body',
      required: !!requestBody.required,
      jsonSchema: getSchemaFromRequestBody(),
    },
  ];
};

function isFormdataRequest(requestBody: OA3BodyParam): boolean {
  return !!requestBody.content[contentTypeFormData];
}

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

export type PathObject = {
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

type Options<T> = {
  [K: string]: any;
}

export const getFields = <TContext>(
  endpoints: Endpoints,
  isMutation: boolean, // TODO 
  gqlTypes: GraphQLTypeMap,
  { callBackend }: Options<TContext>,
): GraphQLFieldConfigMap<any, any> => {
  return Object.keys(endpoints)
    .reduce((result, operationId) => {
      const endpoint: Endpoint = endpoints[operationId];
      const type = jsonSchemaTypeToGraphQL(
        operationId,
        endpoint.response || { type: 'object', properties: {} },
        'response',
        false,
        gqlTypes,
        true,
      );
      const gType: GraphQLFieldConfig<any, any> = {
        type,
        description: endpoint.description,
        args: mapParametersToFields(endpoint.parameters, operationId, gqlTypes),
        resolve: async (
          _source: any,
          args: GraphQLParameters,
          context: TContext,
          info: GraphQLResolveInfo,
        ): Promise<any> => {
          return parseResponse(
            await callBackend({
              context,
              requestOptions: endpoint.getRequestOptions(args),
            }),
            info.returnType,
          );
        },
      };
      return { ...result, [operationId]: gType };
     
    }, {});
};
