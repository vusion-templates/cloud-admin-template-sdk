"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const actions_1 = __importDefault(require("./actions"));
function default_1(plop) {
    const dest = plop.getDestBasePath();
    return {
        prompts: [
            {
                type: 'list',
                name: 'name',
                required: true,
                message: '请选择要删除的入口页名称',
                choices() {
                    const pages = [];
                    const viewsRoot = path_1.default.join(dest, './src/views');
                    fs_extra_1.default.readdirSync(viewsRoot).forEach((innerDir) => {
                        const stat = fs_extra_1.default.statSync(path_1.default.resolve(viewsRoot, innerDir));
                        if (stat.isDirectory()) {
                            pages.push(innerDir);
                        }
                    });
                    return pages;
                },
            },
        ],
        actions(answers) {
            const { name } = answers;
            return [
                ...actions_1.default.remove(answers, dest),
                [
                    `页面 ${name} 已经被删除。你需要${chalk_1.default.green(`重新启动 dev server`)}。`,
                    `需要注意以下几点：`,
                    `  Webpack 配置 (vue pages 配置) 在 ${chalk_1.default.yellow(`pages.json`)} 中`,
                    `  代理在 ${chalk_1.default.yellow('webpack.dev-server.js')} 中，可能需要修改`,
                ].join('\n'),
            ];
        },
    };
}
exports.default = default_1;
