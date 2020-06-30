"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const utils_1 = require("../../utils");
const ms = __importStar(require("vusion-api/out/ms"));
const utils = {
    loadPage(root) {
        return JSON.parse(fs.readFileSync(path.join(root, './pages.json')).toString());
    },
    setPage(root, pages) {
        fs.writeFileSync(path.join(root, './pages.json'), JSON.stringify(pages, null, 4));
    },
};
exports.default = {
    add(pageInfo, root) {
        const { name, title, template, auth } = pageInfo;
        const dest = path.join(root, './src/views', pageInfo.name);
        const base = path.join(__dirname, '../../../../template/page');
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
                        options: {
                            auth,
                        },
                    };
                    utils.setPage(root, pages);
                }
            },
            {
                type: 'addMany',
                destination: utils_1.fixSlash(dest),
                base: utils_1.fixSlash(path.join(base, 'src')),
                templateFiles: utils_1.fixSlash(path.join(base, 'src/**')),
            },
            function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let content = '';
                    const packageName = `@cloud-ui/s-${template}.vue`;
                    const blockCacheDir = ms.getCacheDir('blocks');
                    const blockPath = yield ms.download.npm({
                        registry: 'https://registry.npmjs.org',
                        name: packageName,
                    }, blockCacheDir);
                    content = yield fs.readFile(path.join(blockPath, 'index.vue'), 'utf8');
                    yield fs.writeFile(path.join(dest, 'views/index.vue'), content);
                });
            },
            {
                type: 'add',
                path: path.join(root, './src/pages', name + '.html'),
                base,
                templateFile: path.join(base, 'index.html'),
            },
        ];
    },
    remove(pageInfo, root) {
        const { name } = pageInfo;
        const viewsRoot = path.join(root, './src/views');
        const dest = path.join(viewsRoot, name);
        return [
            function () {
                fs.removeSync(dest);
                fs.removeSync(path.join(root, './src/pages', name + '.html'));
                const pages = utils.loadPage(root);
                delete pages[name];
                utils.setPage(root, pages);
            },
        ];
    }
};
