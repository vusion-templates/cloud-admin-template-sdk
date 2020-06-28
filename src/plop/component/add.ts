import path from 'path';
import chalk from 'chalk';
import actions from './actions';
export default function (plop): any{
    const dest = plop.getDestBasePath();
    const basePath = path.join(dest, './src/global/components');
    return {
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: '请输入组件的文件名, 如 u-text',
                validate(value: string): boolean | string {
                    if ((/^[a-z]-([a-z])/).test(value)) { return true; }
                    return '组件名必须格式类似 u-text';
                },
            },
            {
                type: 'directory',
                message: '组件的路径',
                name: 'directory',
                basePath,
            },
        ],
        actions(answers): ReturnType<typeof actions.add> {
            return [
                ...actions.add(answers, dest),
                `use like: ${chalk.yellow(`<${answers.name}></${answers.name}>`)}`,
            ];
        },
    };
}
