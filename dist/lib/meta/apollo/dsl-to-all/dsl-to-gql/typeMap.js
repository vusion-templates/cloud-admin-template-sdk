"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapParametersToFields = exports.createGraphQLType = exports.getTypeFields = exports.jsonSchemaTypeToGraphQL = void 0;
/* eslint-disable no-param-reassign */
const graphql_1 = require("graphql");
const json_schema_1 = require("./json-schema");
const primitiveTypes = {
    string: graphql_1.GraphQLString,
    date: graphql_1.GraphQLString,
    integer: graphql_1.GraphQLInt,
    number: graphql_1.GraphQLFloat,
    boolean: graphql_1.GraphQLBoolean,
};
const jsonType = new graphql_1.GraphQLScalarType({
    name: 'JSON',
    serialize(value) {
        return value;
    },
});
function getPrimitiveType(format, type) {
    const primitiveTypeName = format === 'int64' ? 'string' : type;
    const primitiveType = primitiveTypes[primitiveTypeName];
    if (!primitiveType) {
        return primitiveTypes.string;
    }
    return primitiveType;
}
exports.jsonSchemaTypeToGraphQL = (title, jsonSchema, propertyName, isInputType, gqlTypes, required) => {
    const baseType = (() => {
        if (json_schema_1.isBodyType(jsonSchema)) {
            return exports.jsonSchemaTypeToGraphQL(title, jsonSchema.schema, propertyName, isInputType, gqlTypes, required);
        }
        if (json_schema_1.isObjectType(jsonSchema) || json_schema_1.isArrayType(jsonSchema)) {
            // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
            return exports.createGraphQLType(jsonSchema, `${title}_${propertyName}`, isInputType, gqlTypes);
        }
        if (jsonSchema.type === 'file') {
            // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
            return exports.createGraphQLType({
                type: 'object',
                required: [],
                properties: { unsupported: { type: 'string' } },
            }, `${title}_${propertyName}`, isInputType, gqlTypes);
        }
        if (jsonSchema.type) {
            return getPrimitiveType(jsonSchema.format, jsonSchema.type);
        }
        throw new Error(`Don't know how to handle schema ${JSON.stringify(jsonSchema)} without type and schema`);
    })();
    return (required
        ? graphql_1.GraphQLNonNull(baseType)
        : baseType);
};
const makeValidName = (name) => name.replace(/[^_0-9A-Za-z]/g, '_');
exports.getTypeFields = (jsonSchema, title, isInputType, gqlTypes) => {
    return () => {
        const properties = {};
        if (json_schema_1.isObjectType(jsonSchema)) {
            Object.keys(jsonSchema.properties).forEach(key => {
                properties[makeValidName(key)] = jsonSchema.properties[key];
            });
        }
        return Object.keys(properties).reduce((prev, propertyName) => {
            const propertySchema = properties[propertyName];
            const type = exports.jsonSchemaTypeToGraphQL(title, propertySchema, propertyName, isInputType, gqlTypes, !!(json_schema_1.isObjectType(jsonSchema) &&
                jsonSchema.required &&
                jsonSchema.required.includes(propertyName)));
            return Object.assign(Object.assign({}, prev), { [propertyName]: {
                    description: propertySchema.description,
                    type,
                } });
        }, {});
    };
};
exports.createGraphQLType = (jsonSchema, title, isInputType, gqlTypes) => {
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
    }
    else if (!jsonSchema.title) {
        jsonSchema = Object.assign(Object.assign({}, jsonSchema), { title });
    }
    if (json_schema_1.isArrayType(jsonSchema)) {
        const itemsSchema = Array.isArray(jsonSchema.items)
            ? jsonSchema.items[0]
            : jsonSchema.items;
        if (json_schema_1.isObjectType(itemsSchema) || json_schema_1.isArrayType(itemsSchema)) {
            return new graphql_1.GraphQLList(graphql_1.GraphQLNonNull(exports.createGraphQLType(itemsSchema, `${title}_items`, isInputType, gqlTypes)));
        }
        if (itemsSchema.type === 'file') {
            // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
            return new graphql_1.GraphQLList(graphql_1.GraphQLNonNull(exports.createGraphQLType({
                type: 'object',
                required: [],
                properties: { unsupported: { type: 'string' } },
            }, title, isInputType, gqlTypes)));
        }
        const primitiveType = getPrimitiveType(itemsSchema.format, itemsSchema.type);
        return new graphql_1.GraphQLList(graphql_1.GraphQLNonNull(primitiveType));
    }
    if (json_schema_1.isObjectType(jsonSchema) &&
        !Object.keys(jsonSchema.properties || {}).length) {
        return jsonType;
    }
    const { description } = jsonSchema;
    const fields = exports.getTypeFields(jsonSchema, title, isInputType, gqlTypes);
    let result;
    if (isInputType) {
        result = new graphql_1.GraphQLInputObjectType({
            name: title,
            description,
            fields: fields,
        });
    }
    else {
        result = new graphql_1.GraphQLObjectType({
            name: title,
            description,
            fields: fields,
        });
    }
    gqlTypes[title] = result;
    return result;
};
exports.mapParametersToFields = (parameters, typeName, gqlTypes) => {
    return parameters.reduce((res, param) => {
        const type = exports.jsonSchemaTypeToGraphQL(`param_${typeName}`, param.jsonSchema, param.name, true, gqlTypes, param.required);
        res[param.name] = {
            type,
        };
        return res;
    }, {});
};
