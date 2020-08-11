import chalk = require('chalk');
import actions from './actions';
import NodePlop from '..';

export default function(plop: NodePlop.API): any {
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
        actions(answers): ReturnType<typeof actions.remove> {
            return [
                ...actions.remove(answers, project),
                [
                    `接口${chalk.blue(answers.name)} 已经被删除。`
                ].join('\n'),
            ];
        },
    };
}
