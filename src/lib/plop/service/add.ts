import chalk = require('chalk');
import actions from './actions';
import NodePlop from '..';
export default function(plop: NodePlop.API): any {
    const project = plop.$project;
    return {
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: '请输入接口名称',
            },
        ],
        actions(answers: any): ReturnType<typeof actions.add> {
            return [
                ...actions.add(answers, project),
                [
                    `接口 ${chalk.blue(answers.name)} 已经添加成功。`,
                    `需要注意以下几点：`,
                    `  入口 JS 文件为 ${chalk.yellow(`${project.service.load(answers.name).fullPath}`)}`,
                ].join('\n'),
            ];
        },
    };
}
