import {
  DSLSchema,
  isOa3Param,
  Oa3Param,
  Responses,
  GraphQLParameters,
  OA3BodyParam,
  getParamDetailsFromRequestBody,
  Endpoints,
  Oa2NonBodyParam,
  getFields
} from "./config";
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfig, GraphQLResolveInfo, GraphQLFieldConfigMap } from "graphql";
import { RootGraphQLSchema, JSONSchemaType, ObjectSchema } from "./json-schema";
import { UpdateListSchemaOfEntity } from "../selfdefine/schemaGQL";

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
const replaceOddChars = (str: string): string =>
  str.replace(/[^_a-zA-Z0-9]/g, '_');


export const getParamDetails = (param: Oa3Param | Oa2NonBodyParam): StructureParam => {
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


export const getEntityResponse = (
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
    return UpdateListSchemaOfEntity(successResponse.schema);
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
  resolverOptions: ResolverOptions;
}

export interface ResolverOptions {
  baseUrl: string;
  path: string;
  // 扩展配置
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
export const getAllInterfaces = (schema: DSLSchema = {}) => {
  const allOperations: {
    [key: string]: any;
  } = {};
  Object.keys(schema).forEach((itmicro: string) => {
    const schemaItmicro: {
      [operationId: string]: any;
    } = schema[itmicro];

    Object.keys(schemaItmicro || {}).forEach((name: string) => {
      const apiObject: {
        [operationId: string]: any;
      } = schemaItmicro[name];

      if (name === 'entities') {
        Object.keys(apiObject).forEach((entityName: string) => {
          const entityObject = apiObject[entityName];
          const enetityResolvers = (entityObject || {}).resolvers || {};
          Object.keys(enetityResolvers).forEach((path) => {
            const route = enetityResolvers[path];
            Object.keys(route).forEach((method: string) => {
              const operationObject = route[method];
              const { operationId } = operationObject;
              const bodyParams = operationObject.requestBody
                ? getParamDetailsFromRequestBody(operationObject.requestBody)
                : [];

              const parameterDetails = [
                ...(operationObject.parameters
                  ? operationObject.parameters.map((param: Oa2NonBodyParam) => getParamDetails(param))
                  : []),
                ...bodyParams,
              ];

              allOperations[operationId] = {
                parameters: parameterDetails,
                description: operationObject.description,
                response: getEntityResponse(operationObject.responses),
                config: {
                  path,
                  baseUrl: '',
                  query: parameterDetails,
                  extendConfig: operationObject.extendConfig,
             //     query: { start: 0 } // todo get from 
                },
                // getRequestOptions: (parameterValues: GraphQLParameters) => {
                //   return getRequestOptions({
                //     parameterDetails,
                //     parameterValues,
                //     baseUrl: '', // 网关域名
                //     path,
                //     method,
                //     formData: operationObject.consumes
                //       ? !operationObject.consumes.includes('application/json')
                //       : operationObject.requestBody
                //         ? isFormdataRequest(operationObject.requestBody)
                //         : false,
                //   });
                // },
                mutation: false,
              };
            });
          })
        })

      } else {
        /**
          * entities {
          *   key: any
          * }
          * structures {
          *   key: any
          * }
          */
        // Object.keys(apiObject).forEach((operationId) => {
        //   const operationObject = apiObject[operationId];

        //   const bodyParams = operationObject.requestBody
        //     ? getParamDetailsFromRequestBody(operationObject.requestBody)
        //     : [];

        //   const parameterDetails = [
        //     ...(operationObject.parameters
        //       ? operationObject.parameters.map((param: Oa2NonBodyParam) => getParamDetails(param))
        //       : []),
        //     ...bodyParams,
        //   ];

        //   allOperations[operationId] = {
        //     response: Object.assign(operationObject, {
        //       parameters: parameterDetails,
        //       mutation: false
        //     })
        //   };
        // })
      }
    });
  })

  return allOperations;
};

type Options<T> = {
  [K in keyof T]: K extends 'context' ? T[K] : number
}

export const schemaFromStructures = <TContext>(
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
