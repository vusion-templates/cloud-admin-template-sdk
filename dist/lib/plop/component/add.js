"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const actions_1 = __importDefault(require("./actions"));
function default_1(plop) {
    const dest = plop.getDestBasePath();
    const basePath = path_1.default.join(dest, './src/global/components');
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
                `use like: ${chalk_1.default.yellow(`<${answers.name}></${answers.name}>`)}`,
            ];
        },
    };
}
exports.default = default_1;
