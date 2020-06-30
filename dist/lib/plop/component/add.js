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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const chalk = require("chalk");
const actions_1 = __importDefault(require("./actions"));
function default_1(plop) {
    const dest = plop.getDestBasePath();
    const basePath = path.join(dest, './src/global/components');
    return {
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: '请输入组件的文件名, 如 u-text',
                validate(value) {
                    if ((/^[a-z]-([a-z])/).test(value)) {
                        return true;
                    }
                    return '组件名必须格式类似 u-text';
                },
            },
            {
                type: 'directory',
                message: '组件的路径',
                name: 'directory',
                basePath,
            },
        ],
        actions(answers) {
            return [
                ...actions_1.default.add(answers, dest),
                `use like: ${chalk.yellow(`<${answers.name}></${answers.name}>`)}`,
            ];
        },
    };
}
exports.default = default_1;
