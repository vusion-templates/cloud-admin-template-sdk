import Page, { AddPage, RemovePage } from '../page';
import Component, { AddComponent } from '../component';
import { PlopConfig } from '../utils';
import { ProjectPath } from '../common';
export default class Project implements ProjectPath {
    root: string;
    constructor(root: any);
    getFullPath(): string;
    addComponent(answers: AddComponent, config: PlopConfig): ReturnType<typeof Component.add>;
    addPage(answers: AddPage, config: PlopConfig): ReturnType<typeof Page.add>;
    removePage(answers: RemovePage, config: PlopConfig): ReturnType<typeof Page.remove>;
    getPage(page: any): Page<Project>;
    getPages(page: any): Page<Project>[];
}
