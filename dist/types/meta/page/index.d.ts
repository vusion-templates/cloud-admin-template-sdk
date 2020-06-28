import { Layout } from './config';
import { PlopConfig } from '../utils';
import { ProjectPath } from '../common';
export interface AddPage {
    name: string;
    title: string;
    layout: Layout;
}
export interface RemovePage {
    name: string;
}
export default class Page<T> implements ProjectPath {
    name: string;
    root: string;
    parent?: T;
    constructor(name: string, root: string, parent?: T);
    getFullPath(): string;
    static add(answers: AddPage, config: PlopConfig): Promise<any>;
    static remove(answers: RemovePage, config: PlopConfig): Promise<any>;
}
