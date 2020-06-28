"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const chalk_1 = require("chalk");
const actions_1 = require("./actions");
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
                    const viewsRoot = path.join(dest, './src/views');
                    fs.readdirSync(viewsRoot).forEach((innerDir) => {
                        const stat = fs.statSync(path.resolve(viewsRoot, innerDir));
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
