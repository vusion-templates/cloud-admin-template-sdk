import * as path from 'path';
import * as fs from 'fs-extra';
import { fixSlash } from '../../utils';
import * as vusion from 'vusion-api';

interface PageInfo {
    name: string;
    title: string;
    template: string; // 页面模板，当前先直接使用区块代替
}
const utils = {
    loadPage(root: string): object {
        return JSON.parse(fs.readFileSync(path.join(root,'./pages.json')).toString());
    },
    setPage(root: string, pages: object): void {
        fs.writeFileSync(path.join(root, './pages.json'), JSON.stringify(pages, null, 4));
    },
}
export default {
    add(pageInfo: PageInfo, root: string): Array<Function|object|string> {
        const { name, title, template } = pageInfo;
        const dest = path.join(root, './src/views', pageInfo.name);
        const base = path.join(__dirname, '../../../../template/page');
        return [
            function (): void|Error {
                if (!name) {
                    throw new Error('name 为空');
                } else {
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
                    }
                    utils.setPage(root, pages);
                }
            },
            {
                type: 'addMany',
                destination: fixSlash(dest),
                base: fixSlash(path.join(base, 'src')),
                templateFiles: fixSlash(path.join(base, 'src/**')),
            },
            async function() {
                let content = '';
                const packageName = `@cloud-ui/s-${template}.vue`;

                const blockCacheDir = vusion.ms.getCacheDir('blocks');
                const blockPath = await vusion.ms.download.npm({
                    registry: 'https://registry.npmjs.org',
                    name: packageName,
                }, blockCacheDir);

                content = await fs.readFile(path.join(blockPath, 'index.vue'), 'utf8');

                await fs.writeFile(path.join(dest, 'views/index.vue'), content);
            },
            {
                type: 'add',
                path: path.join(root, './src/pages', name + '.html'),
                base,
                templateFile: path.join(base, 'index.html'),
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
                const pages = utils.loadPage(root);
                delete pages[name];
                utils.setPage(root, pages);
            },
        ];
    }
}