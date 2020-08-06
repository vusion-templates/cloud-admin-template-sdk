import Tree from '../common/tree';
import File from '../common/file';
import { ProjectPath } from '../common';
import type Page from '../page';
import { mergeCode, saveCode, addBlock, getViewContent } from 'vusion-api/out/designer/index';
import type { ViewInfo } from 'vusion-api/src/designer/index';
export { ViewInfo };
export declare type ViewOptions = {
    title: string;
    template?: string;
};
export declare type BlockInfo = {
    name: string;
    title: string;
    tagName: string;
    dependencies: any;
    registry: string;
    uuid?: string;
};
export default class View extends Tree implements ProjectPath {
    file: File;
    constructor(name: string, root: string, parent: Page);
    static getFullPath: (root: string, name: string) => string;
    static getViewsPath: (root: string) => string[];
    getFullPath(): string;
    getContent(): string;
    static removeView(root: string, name: string): ReturnType<File["remove"]>;
    static addView(root: string, name: string, options: ViewOptions): ReturnType<File["save"]>;
    mergeCode(code: string, nodePath: string): Promise<typeof mergeCode>;
    saveCode(type: string, content: string): Promise<typeof saveCode>;
    addBlock(blockInfo: BlockInfo): Promise<typeof addBlock>;
    getViewContent(viewInfo: ViewInfo): Promise<typeof getViewContent>;
    addCustomComponent(blockInfo: BlockInfo, content: string): Promise<typeof addBlock>;
}
