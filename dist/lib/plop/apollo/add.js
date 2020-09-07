"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const actions_1 = __importDefault(require("./actions"));
function default_1(plop) {
    const project = plop.$project;
    return {
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: '请输入数据实体名称',
            },
        ],
        actions(answers) {
            return [
                ...actions_1.default.addEntity(answers, project),
                [
                    `接口 ${chalk.blue(answers.name)} 已经添加成功。`,
                    `需要注意以下几点：`,
                    `  入口 JS 文件为 ${chalk.yellow(`${project.apollo.loadEntityGQLFilePath(answers.name)}`)}`,
                ].join('\n'),
            ];
        },
    };
}
exports.default = default_1;
