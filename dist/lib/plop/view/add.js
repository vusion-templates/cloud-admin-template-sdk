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
const chalk = require("chalk");
const path = __importStar(require("path"));
const actions_1 = __importDefault(require("./actions"));
function default_1(plop) {
    const project = plop.$project;
    const pages = project.page.loadListPath();
    return {
        prompts: [
            {
                type: 'list',
                name: 'page',
                required: true,
                message: '请选择入口页',
                choices: pages,
                when() {
                    return pages.length > 1;
                },
            },
            {
                type: 'input',
                name: 'path',
                required: true,
                message: '请输入页面访问路径',
                validate(value) {
                    if (value) {
                        return true;
                    }
                    return '请输入页面访问路径';
                },
            },
            {
                type: 'input',
                name: 'title',
                message: '请输入页面标题',
            },
        ],
        actions(answers) {
            answers.page = answers.page || pages[0];
            const { path: pagePath } = answers;
            return [
                ...actions_1.default.add(answers, project),
                [
                    `页面 ${chalk.blue(path.join(pagePath, 'index.vue'))} 已经添加成功。`,
                    `需要注意以下几点：`,
                    `  入口 JS 文件为 ${chalk.yellow(`src/views/${answers.page}/views/${answers.path}/index.vue`)}`,
                ].join('\n'),
            ];
        },
    };
}
exports.default = default_1;
