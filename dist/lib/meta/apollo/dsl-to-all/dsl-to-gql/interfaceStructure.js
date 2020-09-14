"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaFromStructures = exports.getAllInterfaces = exports.getServerPath = exports.getSuccessResponse = exports.getParamDetails = exports.addTitlesToJsonSchemas = void 0;
const confg_1 = require("./confg");
const graphql_1 = require("graphql");
const typeMap_1 = require("./typeMap");
const _1 = require(".");
const getRequestOptions_1 = require("./getRequestOptions");
function addTitlesToJsonSchemas(schema) {
    const jsonSchemas = schema.structures || {};
    Object.keys(jsonSchemas).forEach(schemaName => {
        const jsonSchema = jsonSchemas[schemaName];
        jsonSchema.title = jsonSchema.title || schemaName;
    });
    return schema;
}
exports.addTitlesToJsonSchemas = addTitlesToJsonSchemas;
const replaceOddChars = (str) => str.replace(/[^_a-zA-Z0-9]/g, '_');
exports.getParamDetails = (param) => {
    const name = replaceOddChars(param.name);
    const swaggerName = param.name;
    if (confg_1.isOa3Param(param)) {
        const { schema, required, in: type } = param;
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
exports.getSuccessResponse = (responses) => {
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
function isFormdataRequest(requestBody) {
    // TODO return !!requestBody.content[contentTypeFormData];
    return false;
}
const getGQLTypeNameFromURL = (method, url) => {
    const fromUrl = replaceOddChars(url.replace(/[{}]+/g, ''));
    return `${method}${fromUrl}`;
};
exports.getServerPath = (schema) => {
    const server = schema.servers && Array.isArray(schema.servers)
        ? schema.servers[0]
        : schema.host
            ? [
                (schema.schemes && schema.schemes[0]) || 'http',
                '://',
                schema.host,
                schema.basePath,
            ]
                .filter(Boolean)
                .join('')
            : undefined;
    if (!server) {
        return undefined;
    }
    if (typeof server === 'string') {
        return server;
    }
    const { url, variables } = server;
    return variables
        ? Object.keys(server.variables).reduce((acc, variableName) => {
            const variable = server.variables[variableName];
            const value = typeof variable === 'string'
                ? variable
                : variable.default || variable.enum[0];
            return acc.replace(`{${variableName}}`, value);
        }, url)
        : url;
};
/**
 * 获取全部 stucture
 * 创建关联关系
 *
 * @param schema
 */
exports.getAllInterfaces = (schema) => {
    const allOperations = {};
    const serverPath = exports.getServerPath(schema); // get server path
    Object.keys(schema.interfaces).forEach((interfacePath) => {
        const route = schema.interfaces[interfacePath];
        Object.keys(route).forEach((method) => {
            if (method === 'parameters' || method === 'servers') {
                return;
            }
            const operationObject = route[method];
            const isMutation = ['post', 'put', 'patch', 'delete'].indexOf(method) !== -1;
            const operationId = operationObject.operationId
                ? replaceOddChars(operationObject.operationId)
                : getGQLTypeNameFromURL(method, interfacePath);
            // [FIX] for when parameters is a child of route and not route[method]
            if (route.parameters) {
                if (operationObject.parameters) {
                    operationObject.parameters = route.parameters.concat(operationObject.parameters);
                }
                else {
                    operationObject.parameters = route.parameters;
                }
            }
            const bodyParams = operationObject.requestBody
                ? confg_1.getParamDetailsFromRequestBody(operationObject.requestBody)
                : [];
            const parameterDetails = [
                ...(operationObject.parameters
                    ? operationObject.parameters.map((param) => exports.getParamDetails(param))
                    : []),
                ...bodyParams,
            ];
            const structure = {
                parameters: parameterDetails,
                description: operationObject.description,
                response: exports.getSuccessResponse(operationObject.responses),
                resolverOptions: {
                    // parameterDetails,
                    // parameterValues,
                    baseUrl: serverPath,
                    path: interfacePath,
                },
                getRequestOptions: (parameterValues) => {
                    return getRequestOptions_1.getRequestOptions({
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
const getFields = (endpoints, isMutation, // TODO 
gqlTypes, { callBackend }) => {
    return Object.keys(endpoints)
        .reduce((result, operationId) => {
        const endpoint = endpoints[operationId];
        const type = typeMap_1.jsonSchemaTypeToGraphQL(operationId, endpoint.response || { type: 'object', properties: {} }, 'response', false, gqlTypes, true);
        const gType = {
            type,
            description: endpoint.description,
            args: typeMap_1.mapParametersToFields(endpoint.parameters, operationId, gqlTypes),
            resolve: (_source, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
                return _1.parseResponse(yield callBackend({
                    context,
                    requestOptions: endpoint.getRequestOptions(args),
                }), info.returnType);
            }),
        };
        return Object.assign(Object.assign({}, result), { [operationId]: gType });
    }, {});
};
exports.schemaFromStructures = (endpoints, options) => {
    const gqlTypes = {};
    const queryFields = getFields(endpoints, false, gqlTypes, options);
    if (!Object.keys(queryFields).length) {
        throw new Error('Did not find any GET structures');
    }
    const rootType = new graphql_1.GraphQLObjectType({
        name: 'Query',
        fields: queryFields,
    });
    const graphQLSchema = {
        query: rootType,
    };
    return new graphql_1.GraphQLSchema(graphQLSchema);
};
