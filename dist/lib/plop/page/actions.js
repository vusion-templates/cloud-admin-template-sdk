"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../../utils");
const utils = {
    loadPage(root) {
        return JSON.parse(fs_1.default.readFileSync(path_1.default.join(root, './pages.json')).toString());
    },
    setPage(root, pages) {
        fs_1.default.writeFileSync(path_1.default.join(root, './pages.json'), JSON.stringify(pages, null, 4));
    },
};
exports.default = {
    add(pageInfo, root) {
        const { name, title } = pageInfo;
        const dest = path_1.default.join(root, './src/views', pageInfo.name);
        const base = path_1.default.join(__dirname, '../../../../template/page');
        return [
            function () {
                if (!name) {
                    throw new Error('name 为空');
                }
                else {
                    const pages = utils.loadPage(root);
                    if (pages[name]) {
                        throw new Error('该页面已经存在！');
                    }
                    pages[name] = {
                        entry: `./src/views/${name}/index.js`,
                        template: `./src/pages/${name}.html`,
                        filename: `${name}.html`,
                        favicon: './src/pages/favicon.ico',
                        title,
                        inject: true,
                        chunks: [
                            'chunk-vendors',
                            name,
                        ],
                        chunksSortMode: 'manual',
                    };
                    utils.setPage(root, pages);
                }
            },
            {
                type: 'addMany',
                destination: utils_1.fixSlash(dest),
                base: utils_1.fixSlash(path_1.default.join(base, 'src')),
                templateFiles: utils_1.fixSlash(path_1.default.join(base, 'src/**')),
            },
            {
                type: 'add',
                path: path_1.default.join(root, './src/pages', name + '.html'),
                base,
                templateFile: path_1.default.join(base, 'index.html'),
            },
        ];
    },
    remove(pageInfo, root) {
        const { name } = pageInfo;
        const viewsRoot = path_1.default.join(root, './src/views');
        const dest = path_1.default.join(viewsRoot, name);
        return [
            function () {
                fs_extra_1.default.removeSync(dest);
                fs_extra_1.default.removeSync(path_1.default.join(root, './src/pages', name + '.html'));
                const pages = utils.loadPage(root);
                delete pages[name];
                utils.setPage(root, pages);
            },
        ];
    }
};
