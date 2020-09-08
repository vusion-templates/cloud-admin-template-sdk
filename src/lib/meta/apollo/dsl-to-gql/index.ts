import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
} from 'graphql';
import * as refParser from 'json-schema-ref-parser';
import {
  DSLSchema,
} from './getRequestOptions';

import { RequestOptions } from './getRequestOptions';
import { addTitlesToJsonSchemas, schemaFromInferfaces, getAllInterfaces } from './interfaceStructure';

export function parseResponse(response: any, returnType: GraphQLOutputType) {
  const nullableType =
    returnType instanceof GraphQLNonNull ? returnType.ofType : returnType;
  if (
    nullableType instanceof GraphQLObjectType ||
    nullableType instanceof GraphQLList
  ) {
    return response;
  }

  if (nullableType.name === 'String' && typeof response !== 'string') {
    return JSON.stringify(response);
  }

  return response;
}

export { RequestOptions };

export interface CallBackendArguments<TContext> {
  context: TContext;
  requestOptions: RequestOptions;
}

export interface Options<TContext> {
  dslSchema: string;
  callBackend: (args: CallBackendArguments<TContext>) => Promise<any>;
}

export const createSchema = async <TContext>(
  options: Options<TContext>,
): Promise<GraphQLSchema> => {

  const schemaWithoutReferences = (await refParser.dereference(
    options.dslSchema,
  )) as DSLSchema;

  const dslSchema =  addTitlesToJsonSchemas(schemaWithoutReferences);
  const endpoints = getAllInterfaces(dslSchema);
  return schemaFromInferfaces(endpoints, options);
};

export default createSchema;
