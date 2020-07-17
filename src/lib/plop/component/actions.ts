import * as path from 'path';
import { templatePath } from '../../utils';
const fixComponentName = function (name: string): string {
    return name.replace(/^[a-z]/, (a) => a.toUpperCase()).replace(/-([a-z])/g, (a, b) => b.toUpperCase()).replace('.vue', '');
};
export default  {
    add(answers, root: string): Array<Function|object|string> {
        const basePath = path.join(root, './src/global/components');
        const sub = answers.directory.split('/');
        sub.unshift('');
        return [
            {
                type: 'add',
                path: path.join(basePath, answers.directory, answers.name + '.vue'),
                templateFile: path.join(templatePath, './component/index.vue'),
            },
            {
                type: 'modify',
                pattern: /\s+$/,
                path: path.join(basePath, 'index.js'),
                template: `\nexport { default as ${fixComponentName(answers.name)} } from '.${sub.join('/')}/${answers.name}.vue';\n`,
            },
        ];
    }
}