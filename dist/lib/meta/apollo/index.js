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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const tree_1 = __importDefault(require("../common/tree"));
const file_1 = __importDefault(require("../common/file"));
const dsl_to_gql_1 = require("./dsl-to-gql");
const gql_to_randomquery_1 = require("./gql-to-randomquery");
const graphql_1 = require("graphql");
class Apollo extends tree_1.default {
    /**
     * TODO
     * 1. generator resolver
     * 2. write file to right path
     *
     */
    static updateApollo(root, json) {
        return __awaiter(this, void 0, void 0, function* () {
            // dsl json => schema
            const schema = yield dsl_to_gql_1.createSchema({
                dslSchema: json,
                callBackend: () => { return Promise.resolve(1); },
            });
            // output schema
            // cloud-admin-template/src/global/apollo/index.gql
            const schemaApi = new file_1.default(path.join(root, 'index.gql'));
            schemaApi.save(graphql_1.printSchema(schema));
            // schema => full query string
            const configuration = {
                depthProbability: 1,
                breadthProbability: 1,
                ignoreOptionalArguments: false,
                providePlaceholders: true
            };
            const { queryDocument } = gql_to_randomquery_1.generateRandomQuery(graphql_1.buildSchema(`${graphql_1.printSchema(schema)}`), configuration);
            // output query
            // cloud-admin-template/src/views/{test}/index.gql
            const clientApi = new file_1.default(path.join(root, 'index.gql'));
            clientApi.save(graphql_1.print(queryDocument));
        });
    }
}
exports.default = Apollo;
