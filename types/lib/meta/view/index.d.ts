import Tree from '../common/tree';
import File from '../common/file';
import { ProjectPath } from '../common';
import type Page from '../page';
export declare type ViewOptions = {
    title: string;
    template?: string;
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
}
