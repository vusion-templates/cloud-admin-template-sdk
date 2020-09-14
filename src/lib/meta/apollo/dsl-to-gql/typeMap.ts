/* eslint-disable no-param-reassign */
import {
  GraphQLBoolean,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFloat,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLString,
  Thunk,
  GraphQLInputFieldConfig,
} from 'graphql';
import {
  isArrayType,
  isBodyType,
  isObjectType,
  JSONSchemaType,
} from './json-schema';
import { EndpointParam } from './getRequestOptions';

export type GraphQLType = GraphQLOutputType | GraphQLInputType;

export interface GraphQLTypeMap {
  [typeName: string]: GraphQLType;
}
const primitiveTypes = {
  string: GraphQLString,
  date: GraphQLString,
  integer: GraphQLInt,
  number: GraphQLFloat,
  boolean: GraphQLBoolean,
};

const jsonType = new GraphQLScalarType({
  name: 'JSON',
  serialize(value) {
    return value;
  },
});

function getPrimitiveType(
  format: string | undefined,
  type: keyof typeof primitiveTypes,
): GraphQLScalarType {
  const primitiveTypeName = format === 'int64' ? 'string' : type;
  const primitiveType = primitiveTypes[primitiveTypeName];
  if (!primitiveType) {
    return primitiveTypes.string;
  }
  return primitiveType;
}

export const jsonSchemaTypeToGraphQL = <IsInputType extends boolean>(
  title: string,
  jsonSchema: JSONSchemaType,
  propertyName: string,
  isInputType: IsInputType,
  gqlTypes: GraphQLTypeMap,
  required: boolean,
): IsInputType extends true ? GraphQLInputType : GraphQLOutputType => {
  const baseType = ((): GraphQLType => {
    if (isBodyType(jsonSchema)) {
      return jsonSchemaTypeToGraphQL(
        title,
        jsonSchema.schema,
        propertyName,
        isInputType,
        gqlTypes,
        required,
      );
    }
    if (isObjectType(jsonSchema) || isArrayType(jsonSchema)) {
      // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
      return createGraphQLType(
        jsonSchema,
        `${title}_${propertyName}`,
        isInputType,
        gqlTypes,
      );
    }

    if (jsonSchema.type === 'file') {
      // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
      return createGraphQLType(
        {
          type: 'object',
          required: [],
          properties: { unsupported: { type: 'string' } },
        },
        `${title}_${propertyName}`,
        isInputType,
        gqlTypes,
      );
    }

    if (jsonSchema.type) {
      return getPrimitiveType(jsonSchema.format, jsonSchema.type);
    }
    throw new Error(
      `Don't know how to handle schema ${JSON.stringify(
        jsonSchema,
      )} without type and schema`,
    );
  })();
  return (required
    ? GraphQLNonNull(baseType)
    : baseType) as IsInputType extends true
    ? GraphQLInputType
    : GraphQLOutputType;
};

const makeValidName = (name: string): string =>
  name.replace(/[^_0-9A-Za-z]/g, '_');

export const getTypeFields = (
{ jsonSchema, title, isInputType, gqlTypes }:
{ jsonSchema: JSONSchemaType; title: string; isInputType: boolean; gqlTypes: GraphQLTypeMap },
):
  | Thunk<GraphQLInputFieldConfigMap>
  | Thunk<GraphQLFieldConfigMap<any, any>> => () => {
  const properties: {
    [name: string]: JSONSchemaType;
  } = {};
  if (isObjectType(jsonSchema)) {
    Object.keys(jsonSchema.properties).forEach(key => {
      properties[makeValidName(key)] = jsonSchema.properties[key];
    });
  }
  return Object.keys(properties).reduce((prev: {
    [propertyName: string]: {
      description?: string;
      type: GraphQLInputType;
    };
  }, propertyName) => {
    const propertySchema = properties[propertyName];
    const type: any = jsonSchemaTypeToGraphQL(title, propertySchema, propertyName, isInputType, gqlTypes, !!(isObjectType(jsonSchema) &&
      jsonSchema.required &&
      jsonSchema.required.includes(propertyName)));
    return {
      ...prev,
      [propertyName]: {
        description: propertySchema.description,
        type,
      },
    };
  }, {});
};

export const createGraphQLType = (
  jsonSchema: JSONSchemaType | undefined,
  title: string,
  isInputType: boolean,
  gqlTypes: GraphQLTypeMap,
): GraphQLType => {
  title = (jsonSchema && jsonSchema.title) || title;
  title = makeValidName(title);

  if (isInputType && !title.endsWith('Input')) {
    title += 'Input';
  }

  if (title in gqlTypes) {
    return gqlTypes[title];
  }

  if (!jsonSchema) {
    jsonSchema = {
      type: 'object',
      properties: {},
      required: [],
      description: '',
      title,
    };
  } else if (!jsonSchema.title) {
    jsonSchema = { ...jsonSchema, title };
  }

  if (isArrayType(jsonSchema)) {
    const itemsSchema = Array.isArray(jsonSchema.items)
      ? jsonSchema.items[0]
      : jsonSchema.items;
    if (isObjectType(itemsSchema) || isArrayType(itemsSchema)) {
      return new GraphQLList(
        GraphQLNonNull(
          createGraphQLType(
            itemsSchema,
            `${title}_items`,
            isInputType,
            gqlTypes,
          ),
        ),
      );
    }

    if (itemsSchema.type === 'file') {
      // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
      return new GraphQLList(
        GraphQLNonNull(
          createGraphQLType(
            {
              type: 'object',
              required: [],
              properties: { unsupported: { type: 'string' } },
            },
            title,
            isInputType,
            gqlTypes,
          ),
        ),
      );
    }
    const primitiveType = getPrimitiveType(
      itemsSchema.format,
      itemsSchema.type,
    );
    return new GraphQLList(GraphQLNonNull(primitiveType));
  }

  if (
    isObjectType(jsonSchema) &&
    !Object.keys(jsonSchema.properties || {}).length
  ) {
    return jsonType;
  }

  const { description } = jsonSchema;
  const fields = getTypeFields({ jsonSchema, title, isInputType, gqlTypes });
  let result;
  if (isInputType) {
    result = new GraphQLInputObjectType({
      name: title,
      description,
      fields: fields as GraphQLInputFieldConfigMap,
    });
  } else {
    result = new GraphQLObjectType({
      name: title,
      description,
      fields: fields as GraphQLFieldConfigMap<any, any>,
    });
  }
  gqlTypes[title] = result;
  return result;
};

export const mapParametersToFields = (
  parameters: EndpointParam[],
  typeName: string,
  gqlTypes: GraphQLTypeMap,
): GraphQLFieldConfigArgumentMap => {
  return parameters.reduce((res: GraphQLFieldConfigArgumentMap, param) => {
    const type = jsonSchemaTypeToGraphQL(
      `param_${typeName}`,
      param.jsonSchema,
      param.name,
      true,
      gqlTypes,
      param.required,
    );
    res[param.name] = {
      type,
    };
    return res;
  }, {});
};