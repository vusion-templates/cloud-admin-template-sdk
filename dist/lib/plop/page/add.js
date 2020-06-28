"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const actions_1 = __importDefault(require("./actions"));
function default_1(plop) {
    const dest = plop.getDestBasePath();
    return {
        prompts: [
            {
                type: 'input',
                name: 'name',
                required: true,
                message: '请输入入口页名称（如"register"，将作为文件夹名、路径名等使用）',
                validate(value) {
                    if (value) {
                        return true;
                    }
                    return '入口页名称必填';
                },
            },
            {
                type: 'input',
                name: 'title',
                message: '请输入入口页标题（可选，如"用户注册"，作为网页 title 等使用）',
            },
            {
                type: 'boolean',
                name: 'auth',
                message: '是否需要登录验证（默认为 true）',
                default: true,
            },
        ],
        actions(answers) {
            const { name } = answers;
            answers.appName = require(path_1.default.join(dest, 'package.json')).name.replace(/-client$/, '');
            return [
                ...actions_1.default.add(answers, dest),
                [
                    `页面 ${chalk_1.default.blue(name)} 已经添加成功。你需要${chalk_1.default.green(`重新启动 dev server`)}，然后打开 ${chalk_1.default.blue(`/${name}`)} 即可查看。`,
                    `需要注意以下几点：`,
                    `  入口 JS 文件为 ${chalk_1.default.yellow(`src/views/${name}/index.js`)}`,
                    `  入口页面模板为 ${chalk_1.default.yellow(`src/pages/${name}.html`)}`,
                    `  Webpack 配置 (vue pages 配置) 在 ${chalk_1.default.yellow(`pages.json`)} 中`,
                    `  代理在 ${chalk_1.default.yellow('webpack.dev-server.js')} 中，可能需要修改`,
                ].join('\n'),
            ];
        },
    };
}
exports.default = default_1;
