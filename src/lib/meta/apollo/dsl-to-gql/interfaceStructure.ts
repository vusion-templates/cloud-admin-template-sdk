import { 
  DSLSchema, 
  Param, 
  Responses, 
  GraphQLParameters, 
  OA3BodyParam, 
  getParamDetailsFromRequestBody, 
  Endpoints, 
  getParamDetails, 
  PathObject 
} from "./getRequestOptions";
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfig, GraphQLResolveInfo, GraphQLFieldConfigMap } from "graphql";
import { RootGraphQLSchema, JSONSchemaType } from "./json-schema";
import { jsonSchemaTypeToGraphQL, mapParametersToFields, GraphQLTypeMap } from "./typeMap";
import { parseResponse, CallBackendArguments } from ".";
import { getRequestOptions, OperationObject } from './getRequestOptions'; 

export function addTitlesToJsonSchemas(schema: DSLSchema) {
  const jsonSchemas = schema.structures || {};
  Object.keys(jsonSchemas).forEach(schemaName => {
    const jsonSchema = jsonSchemas[schemaName];
    jsonSchema.title = jsonSchema.title || schemaName;
  });

  return schema;
}

export interface Interfaces {
  [operationId: string]: Endpoint;
}
const replaceOddChars = (str: string): string =>
  str.replace(/[^_a-zA-Z0-9]/g, '_');

// const contentTypeFormData = 'application/x-www-form-urlencoded';
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

  // if (successResponse.content) {
  //   return successResponse.content['application/json'].schema;
  // }

  return undefined;
};
function isFormdataRequest(requestBody: OA3BodyParam): boolean {
  // TODO return !!requestBody.content[contentTypeFormData];
  return false;
}

const getGQLTypeNameFromURL = (method: string, url: string): string => {
  const fromUrl = replaceOddChars(url.replace(/[{}]+/g, ''));
  return `${method}${fromUrl}`;
};

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

// api 返回接哦股
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
export const getAllInterfaces = (schema: DSLSchema) => {
  const allOperations: Endpoints = {};
  const serverPath = ''; // TODO
  Object.keys(schema.interfaces).forEach((interfacePath: string) => {
    const route: PathObject = schema.interfaces[interfacePath];
    Object.keys(route).forEach((method: string) => {
      if (method === 'parameters' || method === 'servers') {
        return;
      }
      const operationObject: OperationObject = route[method] as OperationObject;
      const isMutation =
        ['post', 'put', 'patch', 'delete'].indexOf(method) !== -1;
      const operationId = operationObject.operationId
        ? replaceOddChars(operationObject.operationId)
        : getGQLTypeNameFromURL(method, interfacePath);

      const bodyParams = operationObject.requestBody
        ? getParamDetailsFromRequestBody(operationObject.requestBody)
        : [];

      const parameterDetails = [
        ...(operationObject.parameters
          ? operationObject.parameters.map((param: Param) => getParamDetails(param))
          : []),
        ...bodyParams,
      ];

      const structure: Endpoint = {
        parameters: parameterDetails,
        description: operationObject.description,
        response: getSuccessResponse(operationObject.responses),
        getRequestOptions: (parameterValues: GraphQLParameters) => {
          return getRequestOptions({
            parameterDetails,
            parameterValues,
            baseUrl: serverPath,
            path: interfacePath,
            method,
            formData: operationObject.consumes
              ? !operationObject.consumes.includes('application/json')
              : operationObject.requestBody
              ? isFormdataRequest(operationObject.requestBody)
              : false,
          });
        },
        mutation: isMutation,
      };

      allOperations[operationId] = structure;
    });
  });
  return allOperations;
};

const getFields = <TContext>(
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

export const schemaFromInferfaces = <TContext>(
  endpoints: Endpoints,
  options: Options<TContext>,
): GraphQLSchema => {
  const gqlTypes = {};
  const queryFields = getFields(endpoints, false, gqlTypes, options);
  if (!Object.keys(queryFields).length) {
    throw new Error('Did not find any GET structures');
  }
  const rootType = new GraphQLObjectType({
    name: 'Query',
    fields: queryFields,
  });

  const graphQLSchema: RootGraphQLSchema = {
    query: rootType,
  };

   return new GraphQLSchema(graphQLSchema);
};
