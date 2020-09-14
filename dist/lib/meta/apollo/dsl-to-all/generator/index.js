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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputGraphQLQuery = exports.GeneratorGraphTS = exports.FileSave = void 0;
const gql_to_randomquery_1 = require("../gql-to-randomquery");
const graphql_1 = require("graphql");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const ast_to_resolver_1 = require("../ast-to-resolver");
function FileSave(context, path) {
    fs.ensureFileSync(path);
    fs.writeFileSync(path, context);
}
exports.FileSave = FileSave;
function GeneratorGraphTS(keys = []) {
    const graphAST = {
        type: 'Program',
        body: []
    };
    keys.forEach(key => {
        graphAST.body.push({
            type: 'ImportDeclaration',
            specifiers: [
                {
                    type: 'ImportDefaultSpecifier',
                    local: {
                        type: 'Identifier',
                        name: key,
                    }
                }
            ],
            source: {
                type: 'Literal',
                value: `./${key}.gql`
            }
        });
    });
    const newLocal = [];
    const exportAst = {
        type: 'ExportNamedDeclaration',
        declaration: {
            type: 'VariableDeclaration',
            declarations: [{
                    type: 'VariableDeclarator',
                    id: {
                        type: "Identifier",
                        name: 'graph'
                    },
                    init: {
                        type: 'ObjectExpression',
                        properties: newLocal
                    },
                }],
            kind: 'const'
        }
    };
    keys.forEach(key => {
        exportAst.declaration.declarations[0].init.properties.push({
            type: 'Property',
            key: {
                type: 'Identifier',
                name: key
            },
            value: {
                type: 'Identifier',
                name: key
            }
        });
    });
    graphAST.body.push(exportAst);
    return ast_to_resolver_1.generate(graphAST);
}
exports.GeneratorGraphTS = GeneratorGraphTS;
function OutputGraphQLQuery(schema, rootPath) {
    const groupQueryObject = gql_to_randomquery_1.generateQueryByField(graphql_1.buildSchema(`${graphql_1.printSchema(schema)}`));
    Object.keys(groupQueryObject).forEach((fieldName) => {
        const { queryDocument, variableValues } = groupQueryObject[fieldName];
        const queryPath = path.join(rootPath, `/${fieldName}.gql`);
        // output query
        FileSave(graphql_1.print(queryDocument), queryPath);
    });
    const graphJS = GeneratorGraphTS(Object.keys(groupQueryObject));
    const graphJSPath = path.join(rootPath, `/graph.js`);
    FileSave(graphJS, graphJSPath);
}
exports.OutputGraphQLQuery = OutputGraphQLQuery;
