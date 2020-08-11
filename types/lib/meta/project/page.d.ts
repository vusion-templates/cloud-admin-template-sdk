import Page, { AddPage, RemovePage } from '../page';
import { PlopConfig } from '../utils';
import type Project from './';
export interface PageOP {
    add(answers: AddPage, config?: PlopConfig): ReturnType<typeof Page.add>;
    remove(answers: RemovePage, config?: PlopConfig): ReturnType<typeof Page.remove>;
    loadList(): Page[];
    loadListPath(): string[];
    load(pageName: string): Page;
}
export default function (projectRoot: string, project: Project): PageOP;
