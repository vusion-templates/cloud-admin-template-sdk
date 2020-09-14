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
const acorn = __importStar(require("acorn"));
const esrecurse_1 = __importDefault(require("esrecurse"));
const esTemplateResolver_1 = require("../selfdefine/esTemplateResolver");
const paramsTansform_1 = require("./paramsTansform");
/**
 * 要求模版里面只有一个结果值才能找到目标更新
 * 替换请求地址，也可以根据表现层传递过来的参数去配置请求地址
 */
function resolverTemplate(config = {
    baseUrl: '',
    path: '',
    extendConfig: {},
    query: [],
}) {
    const template = esTemplateResolver_1.EntityfunTemplate({
        path: config.path ? paramsTansform_1.PathToBinaryExpressionString(config.path) : 'PATH',
        setFlag: config.extendConfig.setFlag,
        query: config.query ? paramsTansform_1.QueryToObjectExpression(config.query) : {},
    });
    const funTemplateAst = acorn.parse(template);
    return funTemplateAst.body[0].expression;
}
exports.resolverTemplate = resolverTemplate;
exports.UpdateASTFn = (allEndpoints) => __awaiter(void 0, void 0, void 0, function* () {
    // output resolver
    const ast = acorn.parse(esTemplateResolver_1.RootTemplete, {
        sourceType: 'module'
    });
    esrecurse_1.default.visit(ast, {
        ObjectExpression: (node) => __awaiter(void 0, void 0, void 0, function* () {
            Object.keys(allEndpoints).forEach((operateId) => {
                const config = allEndpoints[operateId].config;
                const operateAST = {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: operateId,
                    },
                    value: resolverTemplate(config)
                };
                node.properties[0].value.properties.push(operateAST);
            });
        })
    });
    return ast;
});
