import * as path from 'path';
import Page, { AddPage, RemovePage } from '../page';
import { PlopConfig } from '../utils';
import type Project from './';
const getRootPath = function (root: string): string {
    return path.join(root, 'src/views');
}
export interface PageOP {
    add( answers: AddPage, config?: PlopConfig): ReturnType<typeof Page.add>;
    remove(answers: RemovePage, config?: PlopConfig): ReturnType<typeof Page.remove>;
    loadList(): Page[];
    loadListPath(): string[];
    load(pageName: string): Page;
}
export default function(projectRoot: string, project: Project): PageOP {
    const root = getRootPath(projectRoot);
    return {
        add(answers, config){
            return Page.add(answers, {
                root: projectRoot,
                ...config,
            });
        },
        remove(answers, config){
            return Page.remove(answers, {
                root: projectRoot,
                ...config,
            });
        },
        loadList() {
            const subDirList = this.loadListPath();
            return subDirList.map((pageName) => {
                return this.load(pageName);
            });
        },
        loadListPath() {
            return Page.getPagesPath(root);
        },
        load(pageName) {
            return new Page(pageName, root, project);
        }
    } as PageOP;
}