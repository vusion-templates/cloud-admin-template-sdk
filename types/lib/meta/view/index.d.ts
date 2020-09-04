import Tree from '../common/Tree';
import File from '../common/File';
import { ProjectPath } from '../common';
import type Page from '../page';
import type { ViewInfo } from 'vusion-api/out/designer/index';
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
    vusionDependencies: any;
    registry: string;
    uuid?: string;
};
export default class View extends Tree implements ProjectPath {
    baseName: string;
    file: File;
    children?: Array<View>;
    constructor(name: string, root: string, parent: Page);
    static getFullPath: (root: string, name: string) => string;
    static getAllViewsPath: (root: string) => string[];
    static getViewsPath: (root: string) => string[];
    getFullPath(): string;
    getContent(): string;
    static removeView(root: string, name: string): void;
    static addView(root: string, name: string, options: ViewOptions): void;
    mergeCode(code: string, nodePath: string): Promise<void>;
    saveCode(type: 'template' | 'script' | 'style', content: string): Promise<void>;
    addBlock(blockInfo: BlockInfo): Promise<void>;
    getViewContent(viewInfo: ViewInfo): Promise<import("vusion-api").VueFile>;
    addCustomComponent(blockInfo: BlockInfo, content: string): Promise<void>;
}
