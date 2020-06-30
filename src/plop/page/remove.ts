import * as path from 'path';
import * as fs from 'fs-extra';
import chalk = require('chalk');
import actions from './actions';

export default function(plop): any {
    const dest = plop.getDestBasePath();
    return {
        prompts: [
            {
                type: 'list',
                name: 'name',
                required: true,
                message: '请选择要删除的入口页名称',
                choices(): string[] {
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
        actions(answers): ReturnType<typeof actions.remove> {
            const { name } = answers;
            return [
                ...actions.remove(answers, dest),
                [
                    `页面 ${name} 已经被删除。你需要${chalk.green(`重新启动 dev server`)}。`,
                    `需要注意以下几点：`,
                    `  Webpack 配置 (vue pages 配置) 在 ${chalk.yellow(`pages.json`)} 中`,
                    `  代理在 ${chalk.yellow('webpack.dev-server.js')} 中，可能需要修改`,
                ].join('\n'),
            ];
        },
    };
}
