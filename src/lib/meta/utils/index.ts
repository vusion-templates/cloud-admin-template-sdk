import * as fs from 'fs-extra';
import * as path from 'path';
import nodePlop from 'node-plop';
import type NodePlop from '../../plop';
export type PlopConfig = {
    root: string;
    force?: boolean;
};
export default {
    loadPages(root: string): object {
        return JSON.parse(fs.readFileSync(path.join(root,'./pages.json')).toString());
    },
    getPlop(config: PlopConfig): NodePlop.API {
        let file = path.join(process.cwd(), 'plopfile.js');
        if (!fs.existsSync(file)) {
            file = path.join(__dirname, '../../cli/plopfile.js');  
        }
        const plop = nodePlop(file, {
            destBasePath: config.root,
            force: !!config.force,
        });
        return plop as NodePlop.API;
    },
    getPagePath(answer): string {
        return path.join(answer.root, answer.page);
    },
    getModulePath(answer): string {
        return path.join(answer.root, answer.page, answer.module);
    },
    getViewPath(answer): string {
        return path.join(answer.root, answer.page, answer.module, 'views');
    },
};