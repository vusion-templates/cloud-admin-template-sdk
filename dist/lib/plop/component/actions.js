"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fixComponentName = function (name) {
    return name.replace(/^[a-z]/, (a) => a.toUpperCase()).replace(/-([a-z])/g, (a, b) => b.toUpperCase()).replace('.vue', '');
};
exports.default = {
    add(answers, root) {
        const basePath = path_1.default.join(root, './src/global/components');
        const sub = answers.directory.split('/');
        sub.unshift('');
        return [
            {
                type: 'add',
                path: path_1.default.join(basePath, answers.directory, answers.name + '.vue'),
                templateFile: path_1.default.join(__dirname, '../../../../template/component/index.vue'),
            },
            {
                type: 'modify',
                pattern: /\s+$/,
                path: path_1.default.join(basePath, 'index.js'),
                template: `\nexport { default as ${fixComponentName(answers.name)} } from '.${sub.join('/')}/${answers.name}.vue';\n`,
            },
        ];
    }
};
