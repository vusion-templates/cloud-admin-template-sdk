import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
} from "graphql";
import refParser = require("json-schema-ref-parser");
import { DSLSchema } from "./config";

import { RequestOptions } from "./getRequestOptions";
import { schemaFromStructures, getAllInterfaces } from "./interfaceStructure";

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
  const schemaWithoutReferences = (await refParser.dereference(
    options.dslSchema
  )) as DSLSchema;

  const endpoints = getAllInterfaces(schemaWithoutReferences);
  return {
    schema: schemaFromStructures(endpoints, options),
    endpoints,
  };
};

export default createSchema;
