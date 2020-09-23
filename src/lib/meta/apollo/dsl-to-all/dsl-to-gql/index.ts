import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
} from "graphql";
import refParser = require("json-schema-ref-parser");
import { RequestOptions } from "./getRequestOptions";
import {
  schemaFromStructures,
  addUUIDToSchemas,
  getAllInterfaces,
} from "./interfaceStructure";

export function parseResponse(response: any, returnType: GraphQLOutputType) {
  const nullableType =
    returnType instanceof GraphQLNonNull ? returnType.ofType : returnType;
  if (
    nullableType instanceof GraphQLObjectType ||
    nullableType instanceof GraphQLList
  ) {
    return response;
  }

  if (nullableType.name === "String" && typeof response !== "string") {
    return JSON.stringify(response);
  }

  return response;
}

export { RequestOptions };

export interface CallBackendArguments<TContext> {
  context: TContext;
  requestOptions: RequestOptions;
}

type Options<T> = {
  [K: string]: any;
};

export const createSchema = async <TContext>(
  options: Options<TContext>
): Promise<{
  schema: GraphQLSchema;
  endpoints: {
    [operaterId: string]: any;
  };
}> => {
  const json: any = await refParser.bundle(options.dslSchema);
  const dslSchemaWithUUID = await addUUIDToSchemas(json);
  let schemaWithoutReferences = {};
  // 添加 uuid，为了控制入口函数的调用规则
  schemaWithoutReferences = (await refParser.dereference(dslSchemaWithUUID, {
    continueOnError: false,
  })) as any;
  const endpoints = getAllInterfaces(schemaWithoutReferences);

  return {
    schema: schemaFromStructures(endpoints, options),
    endpoints,
  };
};

export default createSchema;
