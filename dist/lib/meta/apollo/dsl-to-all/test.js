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
const index_1 = require("./index");
/**
 * 用自定义的结构测试转化工具
 *
 * yarn codegen  --dsl-schema=entityResolver.json
 */
require('yargs')
    .scriptName('dsl-test')
    .command('$0', 'Convert swagger schema to graphql schema', (yargs) => {
    yargs.options('dsl-schema', {
        describe: 'Path or url to a swagger schema, can be json or yaml',
        type: 'string',
        demandOption: true,
    });
}, ({ dslSchema }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield index_1.TransforDSL(dslSchema, '/Users/daisy/wy/cloud-admin-template/src/global/apollo');
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}))
    .help().argv;
