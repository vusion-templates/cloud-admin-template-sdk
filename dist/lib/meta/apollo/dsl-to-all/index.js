"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.TransforDSL = void 0;
const dslToGQL = __importStar(require("./dsl-to-gql"));
const graphql_1 = require("graphql");
const ast_to_resolver_1 = require("./ast-to-resolver");
const path = __importStar(require("path"));
const generator_1 = require("./generator");
function TransforDSL(dslSchema, rootPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // define path
            const schemaPath = path.join(rootPath, '/schema.gql');
            const resolverPath = path.join(rootPath, '/resolver.js');
            const { schema, endpoints } = yield dslToGQL.createSchema({
                dslSchema
            });
            // output schema
            generator_1.FileSave(graphql_1.printSchema(schema), schemaPath);
            // output query gql
            generator_1.OutputGraphQLQuery(schema, rootPath);
            // output resolver.js
            const astResult = yield ast_to_resolver_1.UpdateAST(endpoints);
            const result = ast_to_resolver_1.generate(astResult);
            generator_1.FileSave(`${result}`, resolverPath);
        }
        catch (err) {
            console.error(err);
            process.exit(1);
        }
    });
}
exports.TransforDSL = TransforDSL;
