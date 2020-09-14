"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaFromStructures = exports.getAllInterfaces = exports.getEntityResponse = exports.getSuccessResponse = exports.getParamDetails = void 0;
const config_1 = require("./config");
const graphql_1 = require("graphql");
const schemaGQL_1 = require("../selfdefine/schemaGQL");
const replaceOddChars = (str) => str.replace(/[^_a-zA-Z0-9]/g, '_');
exports.getParamDetails = (param) => {
    const name = replaceOddChars(param.name);
    const swaggerName = param.name;
    if (config_1.isOa3Param(param)) {
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
exports.getEntityResponse = (responses) => {
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
        return schemaGQL_1.UpdateListSchemaOfEntity(successResponse.schema);
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
/**
 * 获取全部 stucture
 * 创建关联关系
 *
 * @param schema
 */
exports.getAllInterfaces = (schema = {}) => {
    const allOperations = {};
    Object.keys(schema).forEach((itmicro) => {
        const schemaItmicro = schema[itmicro];
        Object.keys(schemaItmicro || {}).forEach((name) => {
            const apiObject = schemaItmicro[name];
            if (name === 'entities') {
                Object.keys(apiObject).forEach((entityName) => {
                    const entityObject = apiObject[entityName];
                    const enetityResolvers = (entityObject || {}).resolvers || {};
                    Object.keys(enetityResolvers).forEach((path) => {
                        const route = enetityResolvers[path];
                        Object.keys(route).forEach((method) => {
                            const operationObject = route[method];
                            const { operationId } = operationObject;
                            const bodyParams = operationObject.requestBody
                                ? config_1.getParamDetailsFromRequestBody(operationObject.requestBody)
                                : [];
                            const parameterDetails = [
                                ...(operationObject.parameters
                                    ? operationObject.parameters.map((param) => exports.getParamDetails(param))
                                    : []),
                                ...bodyParams,
                            ];
                            allOperations[operationId] = {
                                parameters: parameterDetails,
                                description: operationObject.description,
                                response: exports.getEntityResponse(operationObject.responses),
                                config: {
                                    path,
                                    baseUrl: '',
                                    query: parameterDetails,
                                    extendConfig: operationObject.extendConfig,
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
                    });
                });
            }
            else {
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
    });
    return allOperations;
};
exports.schemaFromStructures = (endpoints, options) => {
    const gqlTypes = {};
    const queryFields = config_1.getFields(endpoints, false, gqlTypes, options);
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
