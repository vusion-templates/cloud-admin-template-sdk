// import { PlopConfig } from '../utils';
// import * as fse from 'fs-extra';
import path from 'path';
import fs from 'fs';
import { ProjectPath } from '../common';
interface ServicePath {
    root: string;
    page: string;
    module: string;
}
export interface AddService extends ServicePath {
    name: string;
    content: object;
}
export interface RemoveService extends ServicePath {
    name: string;
}
export default class Service<T> implements ProjectPath{
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
        return path.join(this.root, this.page, this.module, 'service', this.name);
    }
    public load() {
        // todo
    }
    public save() {
        // todo
    }
    public remove() {
        // todo
    }
    static async add(answers: AddService): Promise<string> {
        return Promise.resolve('');
    }
    static remove(answers: RemoveService): Promise<boolean> {
        return Promise.resolve(true);
    }
}