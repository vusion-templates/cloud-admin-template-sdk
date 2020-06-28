"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fixComponentName = function (name) {
    return name.replace(/^[a-z]/, (a) => a.toUpperCase()).replace(/-([a-z])/g, (a, b) => b.toUpperCase()).replace('.vue', '');
};
exports.default = {
    add(answers, root) {
        const basePath = path.join(root, './src/global/components');
        const sub = answers.directory.split('/');
        sub.unshift('');
        return [
            {
                type: 'add',
                path: path.join(basePath, answers.directory, answers.name + '.vue'),
                templateFile: path.join(__dirname, '../../../../template/component/index.vue'),
            },
            {
                type: 'modify',
                pattern: /\s+$/,
                path: path.join(basePath, 'index.js'),
                template: `\nexport { default as ${fixComponentName(answers.name)} } from '.${sub.join('/')}/${answers.name}.vue';\n`,
            },
        ];
    }
};
