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
exports.createSchema = exports.parseResponse = void 0;
const graphql_1 = require("graphql");
const refParser = require("json-schema-ref-parser");
const interfaceStructure_1 = require("./interfaceStructure");
function parseResponse(response, returnType) {
    const nullableType = returnType instanceof graphql_1.GraphQLNonNull ? returnType.ofType : returnType;
    if (nullableType instanceof graphql_1.GraphQLObjectType ||
        nullableType instanceof graphql_1.GraphQLList) {
        return response;
    }
    if (nullableType.name === 'String' && typeof response !== 'string') {
        return JSON.stringify(response);
    }
    return response;
}
exports.parseResponse = parseResponse;
exports.createSchema = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const schemaWithoutReferences = (yield refParser.dereference(options.dslSchema));
    const endpoints = interfaceStructure_1.getAllInterfaces(schemaWithoutReferences);
    return {
        schema: interfaceStructure_1.schemaFromStructures(endpoints, options),
        endpoints,
    };
});
exports.default = exports.createSchema;
