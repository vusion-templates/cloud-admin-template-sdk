import Page, { AddPage, RemovePage } from '../page';
import { PlopConfig } from '../utils';
import type Project from './';
export default function (projectRoot: string, project: Project): {
    add(answers: AddPage, config?: PlopConfig): Promise<any>;
    remove(answers: RemovePage, config?: PlopConfig): Promise<any>;
    loadList(): Page[];
    loadListPath(): string[];
    load(pageName: string): Page;
};
