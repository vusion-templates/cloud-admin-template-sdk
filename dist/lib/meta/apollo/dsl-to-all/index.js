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
const gql_to_randomquery_1 = require("./gql-to-randomquery");
const graphql_1 = require("graphql");
const fs = __importStar(require("fs"));
const ast_to_resolver_1 = require("./ast-to-resolver");
const acorn = __importStar(require("acorn"));
const path = __importStar(require("path"));
function TransforDSL(dslSchema, rootPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 	const rootPath = '/Users/daisy/wy/vue-cli/gqlclient/src';
            const schema = yield dslToGQL.createSchema({
                dslSchema
            });
            // output schema
            yield fs.writeFileSync(path.join(rootPath, '/schema.gql'), graphql_1.printSchema(schema));
            // output query
            const configuration = {
                depthProbability: 1,
                breadthProbability: 1,
                ignoreOptionalArguments: false,
                providePlaceholders: true
            };
            const { queryDocument, variableValues, seed } = gql_to_randomquery_1.generateRandomQuery(graphql_1.buildSchema(`${graphql_1.printSchema(schema)}`), configuration);
            fs.writeFile(path.join(rootPath, '/client.gql'), graphql_1.print(queryDocument), () => {
                console.info("Successful transfer client");
            });
            // output resolver
            const ast = acorn.parse(`const resolvers = {
			Query: {
			},
		};`);
            const astResult = yield ast_to_resolver_1.UpdateAST(ast, dslSchema);
            const result = ast_to_resolver_1.generate(astResult);
            fs.writeFile(path.join(rootPath, '/resolver.js'), `export ${result}`, () => {
                console.info("Successful output resolver");
            });
        }
        catch (err) {
            console.error(err);
            process.exit(1);
        }
    });
}
exports.TransforDSL = TransforDSL;
