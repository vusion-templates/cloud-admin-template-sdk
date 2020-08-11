import * as path from 'path';
import Tree from '../common/tree';
import File from '../common/file';
import { ProjectPath, LEVEL_ENUM } from '../common';
import type Page from '../page';
import Directory from '../common/directory';
import { templatePath } from '../../utils';
import { mergeCode, saveCode, addBlock, addCustomComponent, getViewContent } from 'vusion-api/out/designer/index';
import type { ViewInfo } from 'vusion-api/src/designer/index';

export {
    ViewInfo
}

export type ViewOptions = {
    title: string;
    template?: string;
};

export type BlockInfo = {
    name: string;
    title: string;
    tagName: string;
    dependencies: any;
    registry: string;
    uuid?: string;
};

export default class View extends Tree implements ProjectPath{

    public file: File;
    constructor(name: string, root: string, parent: Page) {
        super(name, root, LEVEL_ENUM.view, parent);
        this.file = new File(this.fullPath);
    }

    static getFullPath = function (root: string, name: string): string {
        return path.join(root, name, 'index.vue');
    }

    static getAllViewsPath = function(root: string): string[] {
        const dirOP = new Directory(root);
        return dirOP.dirAll().filter((item) => {
            return item.endsWith('index.vue');
        }).map((item) => '/' + item.trim().replace('index.vue', '').replace(/\/$/, ''));
    }
    static getViewsPath = function(root: string): string[] {
        const dirOP = new Directory(root);
        return dirOP.dir().filter((item) => {
            return item.endsWith('index.vue');
        }).map((item) => '/' + item.trim().replace('index.vue', '').replace(/\/$/, ''));
    }

    public getFullPath(): string {
        return View.getFullPath(this.root, this.name);
    }

    public getContent(): string {
        return this.file.load();
    }

    static removeView(root: string, name: string): ReturnType<File["remove"]> {
        const file = new File(View.getFullPath(root, name));
        if (!file.exists()) {
            throw new Error(`file is not exist`);
        }
        return file.remove();
    }
    static addView(root: string, name: string, options: ViewOptions): ReturnType<File["save"]> {
        const file = new File(View.getFullPath(root, name));
        if (file.exists()) {
            throw new Error(`file is exist`);
        }
        const templateFile = new File(path.join(templatePath, 'view/index.vue'));
        return file.save(templateFile.load());
    }

    async mergeCode(code: string, nodePath: string): Promise<typeof mergeCode> {
        return await mergeCode(this.fullPath, code, nodePath);
    }

    async saveCode(type: string, content: string): Promise<typeof saveCode> {
        return await saveCode(this.fullPath, type, content);
    }

    async addBlock(blockInfo: BlockInfo): Promise<typeof addBlock> {
        return await addBlock(this.fullPath, blockInfo);
    }

    async getViewContent(viewInfo: ViewInfo): Promise<typeof getViewContent> {
        viewInfo.fullPath = this.fullPath;
        return await getViewContent(viewInfo);
    }

    async addCustomComponent(blockInfo: BlockInfo, content: string): Promise<typeof addBlock> {
        return await addCustomComponent(this.fullPath, this.getLevel(LEVEL_ENUM.project).getFullPath, blockInfo, content);
    }
}