import {
  DSLSchema,
  isOa3Param,
  Oa3Param,
  Responses,
  GraphQLParameters,
  getParamDetailsFromRequestBody,
  Endpoints,
  Oa2NonBodyParam,
  getFields
} from "./config";
import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { RootGraphQLSchema, JSONSchemaType, BodySchema } from "./json-schema";
import { UpdateListSchemaOfEntity } from "../define/schemaGQL";

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

  if (successResponse.content) {
    return successResponse.content['application/json'].schema;
  }

  return undefined;
};


export const getEntityResponse = (
  responses: Responses = {},
): JSONSchemaType | undefined => {

  if (responses.schema) {
    return UpdateListSchemaOfEntity(responses.schema);
  }

  return undefined;
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

type EnetityResolver = {
  interface: {
    path: string;
    parameters: Oa2NonBodyParam[];
    name: string;
    responses: {
      schema: BodySchema;
    };
    method: string;
    extendConfig: {
      [key: string]: any;
    };
    description: string;
    requestBody?: any;
  };
}

export const getSuccessExample = (
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
    return (successResponse.content['application/json'].examples || {}).default;
  }

  return undefined;
};
export enum ResolverType {
  INTERFACE = 'interface',
  JOIN = 'join',
  JSON = 'json',
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
          const enetityResolvers = (entityObject || {}).resolvers || [];
          enetityResolvers.forEach((enetityResolver: EnetityResolver) => {
            const operationObject = enetityResolver.interface;
            const interfaceName = operationObject.name;
            const method = operationObject.method;
            const bodyParams = operationObject.requestBody
              ? getParamDetailsFromRequestBody(operationObject.requestBody)
              : [];

            const parameterDetails = [
              ...(operationObject.parameters
                ? (Object.values(operationObject.parameters)).map((param: Oa2NonBodyParam) => getParamDetails(param))
                : []),
              ...bodyParams,
            ];

            const isMutation =
            ['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(method) !== -1;
            // combine full path
            const fullPath = `/gw/${itmicro}${operationObject.path}`;
            enetityResolver.interface.path = fullPath;
            const operationName = `${itmicro}_${interfaceName}`;

            allOperations[operationName] = {
              // enetityResolver.type
              type: ResolverType.INTERFACE,
              // 定义 schema 的传入参数
              parameters: parameterDetails,
              description: operationObject.description,
              // 定义 schema 的返回结构
              response: getSuccessResponse(operationObject.responses),
              // 用于确定 resolver 函数的具体表现形式
              resolver: enetityResolver,
              // 定义 resolver 的默认填充数据
              examples: getSuccessExample(operationObject.responses),
              mutation: isMutation,
            };
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
         // TODO support structure gencode
         return allOperations;
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


  const mutationFields = getFields(endpoints, true, gqlTypes, options);
  if (Object.keys(mutationFields).length) {
    graphQLSchema.mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    });
  }

  return new GraphQLSchema(graphQLSchema);
};
