import * as path from 'path';
import chalk = require('chalk');
import actions from './actions';
import NodePlop from '..';

export default function(plop: NodePlop.API): any {
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
                when(): boolean {
                    return pages.length > 1;
                },
            },
            {
                type: 'list',
                name: 'path',
                required: true,
                message: '请选择要删除的页面路径',
                choices(answers): string[] {
                    return project.page.load(answers.page || pages[0]).view.loadListPath();
                },
            },
        ],
        actions(answers): ReturnType<typeof actions.remove> {
            answers.page = answers.page || pages[0];
            const { path: pagePath } = answers;
            return [
                ...actions.remove(answers, project),
                [
                    `页面 ${chalk.blue(path.join(pagePath, 'index.vue'))} 已经被删除。`
                ].join('\n'),
            ];
        },
    };
}
