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
                type: 'list',
                name: 'name',
                message: '请输入接口名称',
                required: true,
                choices: project.service.loadListPath(),
            },
        ],
        actions(answers) {
            return [
                ...actions_1.default.remove(answers, project),
                [
                    `接口${chalk.blue(answers.name)} 已经被删除。`
                ].join('\n'),
            ];
        },
    };
}
exports.default = default_1;
