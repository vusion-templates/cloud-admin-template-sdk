"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamDetailsFromRequestBody = exports.getParamDetails = exports.isOa3Param = exports.getSuccessResponse = void 0;
const json_schema_1 = require("./json-schema");
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
