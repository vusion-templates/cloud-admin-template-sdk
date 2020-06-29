import { ProjectPath } from '../common';
import * as path from 'path';
export default class View<T> implements ProjectPath {
    public name: string;
    public module: string;
    public page: string;
    public root: string;
    public parent?: T;

    constructor(name: string, module: string, page: string, root: string, parent?: T) {
        this.name = name;
        this.module = module;
        this.page = page;
        this.root = root;
        if (parent) {
            this.parent = parent;
        }
    }
    getFullPath(): string {
        return path.join(this.root, this.page, this.module, 'views', this.name);
    }
}