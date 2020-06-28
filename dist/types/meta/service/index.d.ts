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
export default class Service<T> implements ProjectPath {
    name: string;
    module: string;
    page: string;
    root: string;
    parent?: T;
    constructor(name: string, module: string, page: string, root: string, parent?: T);
    getFullPath(): string;
    load(): void;
    save(): void;
    remove(): void;
    static add(answers: AddService): Promise<string>;
    static remove(answers: RemoveService): Promise<boolean>;
}
export {};
