import { Layout } from './config';
import Utils, {PlopConfig} from '../utils';
import { ProjectPath } from '../common';
import path from 'path';
export interface AddPage {
    name: string;
    title: string;
    layout: Layout;
}
export interface RemovePage {
    name: string;
}

export default class Page<T> implements ProjectPath{
    public name: string;
    public root: string;
    public parent?: T;
    constructor(name: string, root: string, parent?: T) {
        this.name = name;
        this.root = root;
        if (parent) {
            this.parent = parent;
        }
    }
    
    getFullPath(): string{
        return path.join(this.root, this.name);
    }

    static add(answers: AddPage, config: PlopConfig): Promise<any> {
        const plop = Utils.getPlop(config);
        return plop.getGenerator('add-page').runActions(answers);
    }
    static remove(answers: RemovePage, config: PlopConfig): Promise<any> {
        const plop = Utils.getPlop(config);
        return plop.getGenerator('remove-page').runActions(answers);
    }
}