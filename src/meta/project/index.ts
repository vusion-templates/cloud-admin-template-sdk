import Page, { AddPage, RemovePage } from '../page';
import Component, { AddComponent } from '../component';
import { PlopConfig } from '../utils';
import { ProjectPath } from '../common';
import path from 'path';
export default class Project implements ProjectPath{

    public root: string;

    constructor(root) {
        this.root = root;
    }
    getFullPath(): string{
        return path.join(this.root);
    }
    public addComponent(answers: AddComponent, config: PlopConfig): ReturnType<typeof Component.add> {
        return Component.add(answers, {
            root: this.root,
            ...config,
        });
    }
    public addPage(answers: AddPage, config: PlopConfig): ReturnType<typeof Page.add> {
        return Page.add(answers, {
            root: this.root,
            ...config,
        });
    }
    public removePage(answers: RemovePage, config: PlopConfig): ReturnType<typeof Page.remove> {
        return Page.remove(answers, {
            root: this.root,
            ...config,
        });
    }

    getPage(page): Page<Project> {
        return new Page<Project>(page, this.root, this);
    }

    getPages(page): Page<Project>[] {
        return [new Page<Project>(page, this.root, this)];
    }

}