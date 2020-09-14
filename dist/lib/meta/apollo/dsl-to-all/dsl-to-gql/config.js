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
exports.getFields = exports.getParamDetailsFromRequestBody = exports.getParamDetails = exports.isOa3Param = exports.getSuccessResponse = void 0;
const json_schema_1 = require("./json-schema");
const typeMap_1 = require("./typeMap");
const _1 = require(".");
const replaceOddChars = (str) => str.replace(/[^_a-zA-Z0-9]/g, '_');
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
    if (successResponse.content) {
        return successResponse.content['application/json'].schema;
    }
    return undefined;
};
exports.isOa3Param = (param) => {
    return !!param.schema;
};
exports.getParamDetails = (param) => {
    const name = replaceOddChars(param.name);
    const swaggerName = param.name;
    if (exports.isOa3Param(param)) {
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
const contentTypeFormData = 'application/x-www-form-urlencoded';
exports.getParamDetailsFromRequestBody = (requestBody) => {
    const formData = requestBody.content[contentTypeFormData];
    function getSchemaFromRequestBody() {
        if (requestBody.content['application/json']) {
            return requestBody.content['application/json'].schema;
        }
        throw new Error(`Unsupported content type(s) found: ${Object.keys(requestBody.content).join(', ')}`);
    }
    if (formData) {
        const formdataSchema = formData.schema;
        if (!json_schema_1.isObjectType(formdataSchema)) {
            throw new Error(`RequestBody is formData, expected an object schema, got "${JSON.stringify(formdataSchema)}"`);
        }
        return Object.entries(formdataSchema.properties).map(([name, schema]) => ({
            name: replaceOddChars(name),
            swaggerName: name,
            type: 'formData',
            required: formdataSchema.required
                ? formdataSchema.required.includes(name)
                : false,
            jsonSchema: schema,
        }));
    }
    return [
        {
            name: 'body',
            swaggerName: 'requestBody',
            type: 'body',
            required: !!requestBody.required,
            jsonSchema: getSchemaFromRequestBody(),
        },
    ];
};
function isFormdataRequest(requestBody) {
    return !!requestBody.content[contentTypeFormData];
}
exports.getFields = (endpoints, isMutation, // TODO 
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
