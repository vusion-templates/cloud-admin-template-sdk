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
exports.UpdateASTFn = exports.resolverTemplate = void 0;
// visit old tree
// import esrecurse from 'esrecurse';
const acorn = __importStar(require("acorn"));
const interfaceStructure_1 = require("../dsl-to-gql/interfaceStructure");
const esrecurse_1 = __importDefault(require("esrecurse"));
const json_schema_ref_parser_1 = require("json-schema-ref-parser");
const esTemplate_1 = require("./esTemplate");
/**
 * 要求模版里面只有一个结果值才能找到目标更新
 * 替换请求地址，也可以根据表现层传递过来的参数去配置请求地址
 */
function resolverTemplate(config) {
    // 获取基础模版节点
    const funTemplateAst = acorn.parse(esTemplate_1.funTemplate);
    esrecurse_1.default.visit(funTemplateAst, {
        Literal: (node) => {
            node.value = `${config.baseUrl}${config.path}`;
        },
    });
    return funTemplateAst.body[0].expression;
}
exports.resolverTemplate = resolverTemplate;
exports.UpdateASTFn = (ast, dslSchema) => __awaiter(void 0, void 0, void 0, function* () {
    const schemaWithoutReferences = (yield json_schema_ref_parser_1.dereference(dslSchema));
    esrecurse_1.default.visit(ast, {
        ObjectExpression: (node) => __awaiter(void 0, void 0, void 0, function* () {
            const endpoints = interfaceStructure_1.getAllInterfaces(schemaWithoutReferences);
            Object.keys(endpoints).forEach((operateId) => {
                const operateObject = endpoints[operateId].resolverOptions;
                const operateAST = {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: operateId,
                    },
                    value: resolverTemplate(operateObject)
                };
                node.properties[0].value.properties.push(operateAST);
            });
        })
    });
    return ast;
});
/**
 *  parse await function, append to page
 * const ast = acorn.parse(`const resolvers = {
        Query: {
        },
    };`);

    acorn.parse 自动生成通用模版，更新局部参数

    用户配置信息加上常用模版共同组合成 resolver 函数和之后的的在页面上使用的查询函数

    1. 参加 gencode 的部分代码
    2. 参数自动编辑逻辑的数据结构组装方法
    3.
 */ 
