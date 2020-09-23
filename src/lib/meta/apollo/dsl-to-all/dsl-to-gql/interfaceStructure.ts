import {
  DSLSchema,
  isOa3Param,
  Oa3Param,
  Responses,
  GraphQLParameters,
  getParamDetailsFromRequestBody,
  Endpoints,
  Oa2NonBodyParam,
  getFields,
  NonBodyParam
} from "./config";
import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { RootGraphQLSchema, JSONSchemaType, BodySchema } from "./json-schema";
import { UpdateListSchemaOfEntity } from "../define/schemaGQL";

export interface Param {
  required: boolean;
  type: "header" | "query" | "formData" | "path" | "body";
  name: string;
  swaggerName: string;
  jsonSchema: JSONSchemaType;
}

interface StructureParam {
  required: boolean;
  type: "header" | "query" | "formData" | "path" | "body";
  name: string;
  swaggerName: string;
  jsonSchema: JSONSchemaType;
}

export interface Interfaces {
  [operationId: string]: Endpoint;
}
const replaceOddChars = (str: string): string =>
  str.replace(/[^_a-zA-Z0-9]/g, "_");

export const getParamDetails = (
  param: Oa3Param | Oa2NonBodyParam
): StructureParam => {
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
  responses: Responses
): JSONSchemaType | undefined => {
  const successCode = Object.keys(responses).find((code) => {
    return code[0] === "2";
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
    return successResponse.content["application/json"].schema;
  }

  return undefined;
};

export const getEntityResponse = (
  responses: Responses = {}
): JSONSchemaType | undefined => {
  if (responses.schema) {
    return UpdateListSchemaOfEntity(responses.schema);
  }

  return undefined;
};
export interface EndpointParam {
  required: boolean;
  type: "header" | "query" | "formData" | "path" | "body";
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
  bodyType: "json" | "formData";
}

export type EntityResolver = {
  uuid: string;
  name: string;
  interface: {
    name: string;
    path: string;
    parameters: Oa2NonBodyParam[];
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
};

type SourceItem = {
  resolverName: string; // 通过 sourceKey 能找到实体模版函数 自定义名字，使用的的时候第二个传入 args 
}

type StructureResolver = {
  type: string;
  params: Param[];
  name: string;
  uuid: string;
  expression: any; // schema structure
  source: {
    [sourceKey: string]: SourceItem;
  };
}

export const getSuccessExample = (
  responses: Responses
): JSONSchemaType | undefined => {
  const successCode = Object.keys(responses).find((code) => {
    return code[0] === "2";
  });

  if (!successCode) {
    return undefined;
  }

  const successResponse = responses[successCode];
  if (!successResponse) {
    throw new Error(`Expected responses[${successCode}] to be defined`);
  }

  if (successResponse.content) {
    return (successResponse.content["application/json"].examples || {}).default;
  }

  return undefined;
};
export enum ResolverType {
  INTERFACE = "interface",
  JOIN = "join",
  JSON = "json",
}

/**
 * resolver 作为信息表达的入口
 */
export const addUUIDToSchemas = (schema: DSLSchema = {}) => {
  Object.keys(schema).forEach((itmicro: string) => {
    const schemaItmicro: {
      [operationId: string]: any;
    } = schema[itmicro];
    console.info('itmicro', itmicro);

    Object.keys(schemaItmicro || {}).forEach((name: string) => {
      const apiObject: {
        [operationId: string]: any;
      } = schemaItmicro[name];
      Object.values(apiObject).map((structureObject: any) => {
        const structureResolvers = (structureObject || {}).resolvers || [];
        structureResolvers.map((resolver: StructureResolver) => {
          /**
           * json 只有一个
           */
          if (resolver.type == ResolverType.JSON) {
            // 因为 json 只有一个，所以使用结构本身的名字
            resolver.uuid = `${itmicro}_${name}_${structureObject.name}`;
            console.info('uuid zxy',resolver.uuid);
          } else {
            // 因为有多个，所有有多个标记的名字，这个类型其实和实体的使用是一样的，
            resolver.uuid = `${itmicro}_${name}_${resolver.name}`;
          }
        })
      })
    });
  })
  return schema;
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

      if (name === "entities") {
        Object.keys(apiObject).forEach((entityName: string) => {
          const entityObject = apiObject[entityName];
          const entityResolvers = (entityObject || {}).resolvers || [];
          entityResolvers.forEach((entityResolver: EntityResolver) => {
            const operationObject = entityResolver.interface;

            const interfaceName = operationObject.name;
            const method = operationObject.method;
            /**
             *  "parameters": {
                  "id": {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "schema": {
                      "type": "string",
                      "format": "",
                      "isLeaf": true
                    }
                  }
                },
                parameters in interface look like this
             */
            const bodyParams = operationObject.requestBody
              ? getParamDetailsFromRequestBody(operationObject.requestBody)
              : [];

            const parameterDetails = [
              ...(operationObject.parameters
                ? Object.values(
                    operationObject.parameters
                  ).map((param: Oa2NonBodyParam) => getParamDetails(param))
                : []),
              ...bodyParams,
            ];

            const isMutation = false;
              // ["POST", "PUT", "PATCH", "DELETE"].indexOf(method) !== -1;
            // combine full path
            const fullPath = `/gw/${itmicro}${operationObject.path}`;
            entityResolver.interface.path = fullPath;
            const operationName = `${itmicro}_entities_${interfaceName}`;

            allOperations[operationName] = {
              // entityResolver.type
              type: ResolverType.INTERFACE,
              // 定义 schema 的传入参数
              parameters: parameterDetails,
              description: operationObject.description,
              // 定义 schema 的返回结构
              response: getSuccessResponse(operationObject.responses),
              // 用于确定 resolver 函数的具体表现形式
              resolver: entityResolver,
              // 定义 resolver 的默认填充数据
              examples: getSuccessExample(operationObject.responses),
              mutation: isMutation,
            };
          })
        })

      }
      // 如果在 structures 和 entities 下面有同名的 resolverName
      // 目前的 structure 当成只有一个 resolver 的情况处理，如果多个的话，其实二次解析的时候也会需要 resolver的 名字
      if (name === 'structures') {
        Object.keys(apiObject).forEach((structureName: string) => {
          const structureObject = apiObject[structureName];
          const structureResolvers = (structureObject || {}).resolvers || [];
          structureResolvers.forEach((structureResolver: StructureResolver) => {

            /**
             * structure resolver params look like this
             * [
             *  {
                    "name": "employeeId",
                    "type": "integer",
                    "format": "int",
                    "isLeaf": true
                }
             * ]
             */
            const operationName = `${itmicro}_structures_${structureName}`;
            const parameterDetails = [
              ...(structureResolver.params ? Object.values(structureResolver.params).map((param: any) => {
                const resolverParams: Oa3Param = {
                  name: param.name,
                  in: 'query',
                  schema: param
                };
                // 转化
                return getParamDetails(resolverParams);
              }) : [])
              //  ...bodyParams, 
            ];

            structureResolver.uuid = operationName;

            allOperations[operationName] = {
              type: ResolverType.JSON,
              parameters: parameterDetails,
              response: structureResolver.expression,
              resolver: structureResolver,
              mutation: false,
            };
          })
        }
        )
      }
    });
  });

  return allOperations;
};

type Options<T> = {
  [K in keyof T]: K extends "context" ? T[K] : number;
};

export function addTitlesToJsonSchemas(schema: DSLSchema) {
  const jsonSchemas: {
    [schema: string]: any;
  } = schema.entities || {};
  Object.keys(jsonSchemas).forEach((schemaName: string) => {
    const jsonSchema = jsonSchemas[schemaName];
    jsonSchema.title = jsonSchema.title || schemaName;
  });

  return schema;
}


export const schemaFromStructures = <TContext>(
  endpoints: Endpoints,
  options: Options<TContext>
): GraphQLSchema => {
  const gqlTypes = {};
  const queryFields = getFields(endpoints, false, gqlTypes, options);
  if (!Object.keys(queryFields).length) {
    throw new Error("Did not find any GET structures");
  }
  const rootType = new GraphQLObjectType({
    name: "Query",
    fields: queryFields,
  });

  const graphQLSchema: RootGraphQLSchema = {
    query: rootType,
  };

  const mutationFields = getFields(endpoints, true, gqlTypes, options);
  if (Object.keys(mutationFields).length) {
    graphQLSchema.mutation = new GraphQLObjectType({
      name: "Mutation",
      fields: mutationFields,
    });
  }

  return new GraphQLSchema(graphQLSchema);
};
