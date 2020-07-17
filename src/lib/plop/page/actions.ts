import * as path from 'path';
import * as fs from 'fs-extra';
import { fixSlash } from '../../utils';
import * as ms from 'vusion-api/out/ms';
import pagesUtil from './pages';
interface PageInfo {
    name: string;
    title: string;
    template: string; // 页面模板，当前先直接使用区块代替
    auth: boolean;
    isIndex: boolean;
}
export default {
    add(pageInfo: PageInfo, root: string): Array<Function|object|string> {
        const { name, title, template, auth, isIndex } = pageInfo;
        const dest = path.join(root, './src/views', pageInfo.name);
        const base = path.join(__dirname, '../../../../template/page');
        return [
            function (): void|Error {
                if (!name) {
                    throw new Error('name 为空');
                } else {
                    const pages = pagesUtil.get(root);
                    if (pages[name]) {
                        throw new Error('该页面已经存在！');
                    }
                    if (isIndex) {
                        Object.keys(pages).forEach((pageName) => {
                            const page = pages[pageName];
                            if (page.options && page.options.isIndex) {
                                page.options.isIndex = false;
                            }
                        });
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
                            isIndex,
                        },
                    }
                    pagesUtil.set(root, pages);
                }
            },
            {
                type: 'addMany',
                destination: fixSlash(dest),
                base: fixSlash(path.join(base, 'src')),
                templateFiles: fixSlash(path.join(base, 'src/**')),
            },
            {
                type: 'add',
                path: path.join(root, './src/pages', name + '.html'),
                base,
                templateFile: path.join(base, 'index.html'),
            },
            async function() {
                if (!template) {
                    return;
                }
                let content = '';
                const packageName = `@cloud-ui/s-${template}.vue`;

                const blockCacheDir = ms.getCacheDir('blocks');
                const blockPath = await ms.download.npm({
                    registry: 'https://registry.npmjs.org',
                    name: packageName,
                }, blockCacheDir);

                content = await fs.readFile(path.join(blockPath, 'index.vue'), 'utf8');
                await fs.writeFile(path.join(dest, 'views/index.vue'), content);

                const pkgInfo = JSON.parse(await fs.readFile(path.join(blockPath, 'package.json'), 'utf8'));
                const deps = pkgInfo.vusionDependencies;
                if (deps && Object.keys(deps).length) {
                    await Promise.all(Object.keys(deps).map((name) => ms.install({
                        name,
                        version: deps[name].replace(/^[^\d]+/, ''),
                    })));
                }
            },
        ];


    },
    remove(pageInfo: PageInfo, root: string): Array<Function|object|string> {
        const { name } = pageInfo;
        const viewsRoot = path.join(root, './src/views');
        const dest = path.join(viewsRoot, name);
        return [
            function (): void {
                fs.removeSync(dest);
                fs.removeSync(path.join(root, './src/pages', name + '.html'));
                const pages = pagesUtil.get(root);
                delete pages[name];
                pagesUtil.set(root, pages);
            },
        ];
    }
}